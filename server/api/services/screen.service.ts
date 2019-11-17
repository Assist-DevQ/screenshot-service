import logger from '../../common/logger'
import { IEvent, DOMEvent } from './types/events'
import puppeteer, { Browser, Page } from 'puppeteer'

export class ScreenService {
  public static async build(): Promise<ScreenService> {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    return new ScreenService(browser, page)
  }

  private readonly browser: Browser
  private readonly page: Page

  private constructor(browser: Browser, page: Page) {
    this.browser = browser
    this.page = page
  }

  public async generateScreens(events: IEvent[]): Promise<void> {
    logger.info('Start generating', events.length)
    if (events.length) {
      const evt = events.pop()
      await this.handleEvent(evt)
      await this.generateScreens(events)
    }
  }

  private async handleEvent(e: IEvent): Promise<void> {
    logger.info('Handling', e.event)
    switch (e.event) {
      case DOMEvent.Start:
        await this.navigate(e)
        return this.takeScreen(e)
      case DOMEvent.Click:
        await this.click(e)
        return this.takeScreen(e)
      case DOMEvent.Change:
        await this.change(e)
        return this.takeScreen(e)
      case DOMEvent.End:
        await this.delay(300)
        return this.takeScreen(e)
      default:
        logger.info('Skipping:', e.event)
    }
  }

  private async change(e: IEvent): Promise<void> {
    await this.page.type(e.data.csspath, e.data.value)
  }

  private async click(e: IEvent): Promise<void> {
    await this.page.click(e.data.csspath)
    logger.info('URL IS:', this.page.url())
  }

  private async takeScreen(e: IEvent): Promise<void> {
    logger.info('Taking screen:', e.data.url)
    await this.page.screenshot({ path: `screens/${e.time}-${e.event}-${e.data.innerText || e.data.type || ''}.png` })
  }

  private async navigate(e: IEvent): Promise<any> {
    logger.info('Navigating:', e.data.url)
    await Promise.all([this.page.goto(e.data.url), this.page.waitForNavigation({ waitUntil: 'networkidle0' })])
  }

  private delay(timeMs: number): Promise<void> {
    return new Promise((res, rej) => {
      setTimeout(res, timeMs)
    })
  }
}
