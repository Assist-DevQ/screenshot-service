import logger from '../../common/logger'
import { IEvent, DOMEvent } from './types/events'
import puppeteer, { Browser, Page } from 'puppeteer'
import { parse } from 'url'
import { IEventFile } from './types/scenario'
import { IScreenMeta } from './types/code-meta'

export class ScreenService {
  public static async build(): Promise<ScreenService> {
    const browser = await puppeteer.launch()
    return new ScreenService(browser)
  }

  private readonly browser: Browser
  private readonly localUrl: string = 'http://localhost'
  private constructor(browser: Browser) {
    this.browser = browser
  }

  public async generateScreens(meta: IScreenMeta, events: IEvent[], port: number): Promise<IEventFile[]> {
    if (events.length === 0) {
      return []
    }
    logger.info('Start generating', events.length)
    const page = await this.browser.newPage()
    try {
      logger.info('New browser page is ready!')
      const eventFiles: IEventFile[] = []
      await this.recScreens(meta, events.reverse(), port, eventFiles, page)
      return eventFiles
    } finally {
      logger.warn('Closing the page')
      page.close()
    }
  }

  private async recScreens(
    meta: IScreenMeta,
    events: IEvent[],
    port: number,
    imgs: IEventFile[],
    page: Page
  ): Promise<void> {
    if (events.length) {
      logger.info('Remaining events:', events.length)
      const evt = events.pop()
      const fileUrl = await this.handleEvent(meta, evt, port, page)
      imgs.push({ eventId: evt.id, fileUrl })
      await this.recScreens(meta, events, port, imgs, page)
    }
  }

  private async handleEvent(meta: IScreenMeta, e: IEvent, port: number, page: Page): Promise<string> {
    logger.info('Handling', e.name)
    switch (e.name) {
      case DOMEvent.Start:
        await this.setViewport(e, page)
        await this.navigate(e, port, page)
        return this.takeScreen(meta, e, page)
      case DOMEvent.Click:
        await this.click(e, page)
        return this.takeScreen(meta, e, page)
      case DOMEvent.Change:
        await this.change(e, page)
        return this.takeScreen(meta, e, page)
      case DOMEvent.End:
        await this.delay(300)
        return this.takeScreen(meta, e, page)
      default:
        logger.info('Skipping:', e.name)
    }
  }

  private async change(e: IEvent, page: Page): Promise<void> {
    await page.type(e.data.csspath, e.data.value)
  }

  private async click(e: IEvent, page: Page): Promise<void> {
    await page.click(e.data.csspath)
    logger.info('URL IS:', page.url())
  }

  private async setViewport(e: IEvent, page: Page): Promise<void> {
    await page.setViewport({
      width: Number(e.data.screenWidth),
      height: Number(e.data.screenHeight),
      deviceScaleFactor: 1
    })
    logger.info(`Page size is:${e.data.screenWidth}/${e.data.screenHeight}`)
  }

  private async takeScreen(meta: IScreenMeta, e: IEvent, page: Page): Promise<string> {
    logger.info('Taking screen:', page.url())
    const path = `${meta.outDir}/${this.computeFileName(meta, e)}.png`
    await page.screenshot({ path })
    return path
  }

  private async navigate(e: IEvent, port: number, page: Page): Promise<any> {
    const testingUrl = this.genUrl(port, e.data.url)
    logger.info('Navigating:', testingUrl)
    await Promise.all([page.goto(testingUrl), page.waitForNavigation({ waitUntil: 'networkidle0' })])
  }

  private genUrl(port: number, originalUrl: string): string {
    const parsedUrl = parse(originalUrl)
    return `${this.localUrl}:${port}${parsedUrl.path}${parsedUrl.hash ? parsedUrl.hash : ''}`
  }

  private delay(timeMs: number): Promise<void> {
    return new Promise((res, rej) => {
      setTimeout(res, timeMs)
    })
  }

  private computeFileName(meta: IScreenMeta, e: IEvent): string {
    return `${meta.commitId}-${meta.projectId}-${meta.scenarioId}-${e.id}-${meta.tag}-${e.name}-${e.data.innerText ||
      e.data.type ||
      ''}`
  }
}
