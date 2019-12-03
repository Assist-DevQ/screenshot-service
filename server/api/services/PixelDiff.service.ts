import { IImageDiff } from "./types/image-diff";
import {PNG} from 'pngjs'
import pixelmatch from 'pixelmatch'

export class PixelDiff {
  public async compare(baseImg: Buffer, otherImg: Buffer): Promise<IImageDiff> {
    const basePng = await this.readPng(baseImg)
    const otherPng = await this.readPng(otherImg)
    const {width, height} = basePng
    const diffPng = new PNG({width, height})
    const diffs = pixelmatch(basePng.data, otherPng.data, diffPng.data , width, height, {threshold: 0.7})
    return {
      hasDiff: diffs > 0,
      diff: diffs > 0 ? diffPng.pack() : undefined
    }
  }

  private readPng(input: Buffer): Promise<PNG> {
    return new Promise((res, rej) => {
      new PNG().parse(input, (err, png) => {
        if (err) { rej(err) }
        res(png)
      })
    })
  }
}