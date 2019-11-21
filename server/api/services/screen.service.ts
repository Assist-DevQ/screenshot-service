import logger from '../../common/logger'
import { IEvent, DOMEvent } from './types/events'
import puppeteer, { Browser, Page } from 'puppeteer'
import { parse } from 'url'

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

  public async generateScreens(events: IEvent[], port: number, imgs: string[] = [], page?: Page): Promise<string[]> {
    if (!page) {
      logger.info('Start generating', events.length)
      page = await this.browser.newPage()
      logger.info('New browser page is ready!')
    }
    if (events.length) {
      logger.info('Remaining events:', events.length)
      const evt = events.pop()
      const imgPath = await this.handleEvent(evt, port, page)
      imgs.push(imgPath)
      await this.generateScreens(events, port, imgs, page)
    } else {
      return imgs
    }
  }

  private async handleEvent(e: IEvent, port: number, page: Page): Promise<string> {
    logger.info('Handling', e.event)
    switch (e.event) {
      case DOMEvent.Start:
        await this.navigate(e, port, page)
        return this.takeScreen(e, page)
      case DOMEvent.Click:
        await this.click(e, page)
        return this.takeScreen(e, page)
      case DOMEvent.Change:
        await this.change(e, page)
        return this.takeScreen(e, page)
      case DOMEvent.End:
        await this.delay(300)
        return this.takeScreen(e, page)
      default:
        logger.info('Skipping:', e.event)
    }
  }

  private async change(e: IEvent, page: Page): Promise<void> {
    await page.type(e.data.csspath, e.data.value)
  }

  private async click(e: IEvent, page: Page): Promise<void> {
    await page.click(e.data.csspath)
    logger.info('URL IS:', page.url())
  }

  private async takeScreen(e: IEvent, page: Page): Promise<string> {
    logger.info('Taking screen:', page.url())
    const path = `screens/${e.time}-${e.event}-${e.data.innerText || e.data.type || ''}.png`
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
}
