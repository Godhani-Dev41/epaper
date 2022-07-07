export interface Post {
  uuid?: string,
  url?: string,
  thread?:any,
  parent_url?: string,
  ord_in_thread?: string,
  author?: string,
  site?: string,
  published?: string,
  title?: string,
  title_full?: string,
  text?: string,
  highlightText?: string,
  highlightTitle?: string,
  language?: string,
  external_images?:any[],
  rating?:string,
  crawled?:string
}
