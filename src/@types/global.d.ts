
declare const __DEV: boolean
declare const __dev: boolean

declare const __STATIC: string
declare const __static: string

declare const __HOST: string
declare const __host: string

declare const __i18n: {[index: string]: any}

declare const __API_HOST: string
declare const __APP_NAME: string
declare const __APP_NAME_CN: string
declare const __APP_VERSION: string
declare const __APP_VERSION_CODE: number
declare const __REGION: string
declare const __CT_APPKEY: string
declare const __CT_APPSECRET: string
declare const __FEED_URL: string
declare const __SOCKET_PORT: number

declare namespace NodeJS  {
  interface Global {
    __static: any
  }
}

declare var Promise: PromiseConstructor


