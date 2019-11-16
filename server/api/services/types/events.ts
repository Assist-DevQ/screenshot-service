export interface IEvent {
  event: DOMEvent
  data: IEventData
  time: number
}

export interface IEventData {
  path: IEventPath[]
  csspath: string
  csspathfull: string
  clientX?: number
  clientY?: number
  scrollX: number
  scrollY: number
  altKey?: boolean
  ctrlKey?: boolean
  shiftKey?: boolean
  metaKey?: boolean
  button?: number
  bubbles?: boolean
  keyCode?: number
  selectValue?: string
  value?: string
  type?: string
  cancelable?: boolean,
  innerText?: any
  url: string
}

export interface IEventPath  {
  uniqueId?: string
  childIndex: number
  tagName: string
}

export enum DOMEvent {
  Start = 'start',
  End = 'end',
  Select = 'select',
  Click = 'click',
  Scroll = 'scroll',
  Change = 'change',
  Cut = 'cut',
  Copy = 'copy',
  Paste = 'paste'
}
