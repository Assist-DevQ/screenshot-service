import { Readable } from "stream";

export interface IImageDiff {
  hasDiff: boolean,
  diff?: Readable,
}
