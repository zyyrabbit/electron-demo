import { AxiosRequestConfig } from 'axios'

export class APIError extends Error {
  public code: number = 0
  public name = this.constructor.name

  public constructor (message: string, code: number) {
    super(message)
    this.code = code
  }
}

export interface APIResponse {
  code: number
  msg?: any
  data?: any
}


export enum APIOptionsHeader {
  NEED_SIGN = '_need_sign',
  NEED_TOKEN = '_need_token'
}


export enum APIErrorCode {
  NO_PERMISSIONS = 40010,     // 没有权限
  IDENTICAL_ID = 40020,       // 重复的requestID
  IDENTICAL_ID_V2 = 40030,    // 同上
  UNBINDING = 30060,          // 未绑定的设备
  NEED_CAPTCHA = 51040,       // 需要验证码
  INVALID_CAPTCHA = 51030,    // 验证码错误
  AUTH_LOCKED = 51020,        // 账号被锁定
  INVALID_PASSWORD = 51010    // 密码错误
}

export interface AuthData {
  userId: number
  tenantId: number
  secretKey: string
  timestamp: number
  token?: string
}

export interface RequestProxyConfig extends AxiosRequestConfig {
  needSign?: boolean
  needToken?: boolean
}