import axios, { 
  AxiosResponse, 
  AxiosInstance, 
  AxiosRequestConfig, 
  AxiosError 
} from 'axios'
import { Message, MessageBox } from 'element-ui'
import { md5 } from '@/utils/node/crypto'
import { IdGenerator } from '@/utils/common/idGenerator'
import { APIResponse, APIOptionsHeader, AuthData } from './common'
import { environment, DeviceType, APPModel } from '@/services/environment/common'

interface SignData {
  deviceType: DeviceType
  timestamp: number
  requestId: number
  secretKey: string
  tenantId: number
  userId: number
  version: number
}

interface APICommonParameters {
  version: number
  deviceType: DeviceType
  appModel: APPModel
}

enum APIHeaders {
  VERSION = 'CTG-VERSION',
  USERID = 'CTG-USERID',
  DEVICETYPE = 'CTG-DEVICETYPE',
  TENANTID = 'CTG-TENANTID',
  TIMESTAMP = 'CTG-TIMESTAMP',
  REQUESTID = 'CTG-REQUESTID',
  SIGNATURESTR = 'CTG-SIGNATURESTR',
  TOKEN = 'X-AUTH-TOKEN',
  APPMODEL = 'CTG-APPMODEL'
}


export class RequestService {
  private idGenerator = new IdGenerator('request#')
  private _apiAgent?: AxiosInstance
  private offsetTime = 0
  private authData: AuthData | null = null
  private apiCommonParameters: APICommonParameters
  private hasTipMessageBox: boolean = false

  public constructor () {
    this.apiCommonParameters = {
      version: environment.appVersionCode,
      deviceType: environment.deviceType,
      appModel: environment.appModel
    }
  }

  public get client (): AxiosInstance {
    return axios.create()
  }

  public get api (): AxiosInstance {
    if (!this._apiAgent) {
      return this.createAPIAgent()
    }

    return this._apiAgent
  }

  public setAuthData (data: AuthData | null): void {
    if (data) {
      this.offsetTime = Date.now() - data.timestamp
    }
    this.authData = data
  }

  protected createAPIAgent (): AxiosInstance {
    this._apiAgent = axios.create({
      timeout: 1000 * 120,
      baseURL: environment.APIHost
    })
    const interceptors = this._apiAgent.interceptors

    // 这里增加具体API业务代码
    interceptors.request.use((config): AxiosRequestConfig => this.resolveAPIRequest(config))
    interceptors.request.use((config): AxiosRequestConfig => this.encodeFormData(config))
    interceptors.response.use((response: AxiosResponse<APIResponse>): AxiosResponse<any> => 
      this.resolveAPIResponse(response), (error): Promise<Error> => this.resolveAPIErrorResponse(error))   

    return this._apiAgent
  }

  private resolveAPIRequest (config: AxiosRequestConfig): AxiosRequestConfig {
    const requestId = this.idGenerator.nextRawId()
    const timestamp = Date.now() - this.offsetTime
    const { deviceType, version, appModel } = this.apiCommonParameters

    config.headers[APIHeaders.DEVICETYPE] = deviceType
    config.headers[APIHeaders.REQUESTID] = requestId
    config.headers[APIHeaders.TIMESTAMP] = timestamp
    config.headers[APIHeaders.VERSION] = version
    config.headers[APIHeaders.APPMODEL] = appModel

    const needSign = !!config.headers[APIOptionsHeader.NEED_SIGN]
   
    if (needSign) {
      if (!this.authData) {
        throw new Error('API用户参数未设置')
      }
      const { tenantId, userId, secretKey } = this.authData

      config.headers[APIHeaders.TENANTID] = tenantId
      config.headers[APIHeaders.USERID] = userId
      config.headers[APIHeaders.SIGNATURESTR] = this.generatorSign({
        deviceType,
        timestamp,
        tenantId,
        userId,
        secretKey,
        requestId,
        version
      })

      delete config.headers[APIOptionsHeader.NEED_SIGN]
    }

    return config
  }

  private encodeFormData (config: AxiosRequestConfig): AxiosRequestConfig {
    if (!config.method) {
      return config
    }
    switch (config.method.toUpperCase()) {
      case 'POST':
      case 'PUT':
        if (config.headers['Content-Type'] === 'application/x-www-form-urlencoded') {
          config.data = (new URLSearchParams(config.data)).toString()
        }
        break
    }
    return config
  }

  private resolveAPIResponse (response: AxiosResponse<APIResponse>): any {
    switch (response.config.responseType) {
      case 'stream':
      case 'blob':
        return response  
    }
    
    if (response.data.code !== 0) {
      if(response.data.code === 40010 && !this.hasTipMessageBox){
        this.hasTipMessageBox = true
        MessageBox.alert(response.data.msg, '用户信息过期',{ 
          confirmButtonText: '重新登录',
          callback: action => {
            this.hasTipMessageBox = false;
            location.hash = '#/login'
            // @ts-ignore
            window.$IPC.send('resize', { width: 370, height: 520 })
            // @ts-ignore
            window.$IPC.sendToClient('exit', {
              return: 1
            })
          }
        })
      } else {
        Message.error(response.data.msg)
      }
      
      return Promise.reject(response.data)
    }

    response.data = response.data.data
    return response
  }

  private resolveAPIErrorResponse (error: AxiosError): Promise<Error> {

    if (error.isAxiosError) {
      switch (error.code) {
        case 'ECONNABORTED':
        case 'ETIMEDOUT':
          error.message = '服务器请求超时，请稍后再试'
          break
        default:
          error.message = '服务器连接失败，请稍后再试'
          break
      }
    }

    return Promise.reject(error)
  }

  private generatorSign (data: SignData): string {
    return md5(`${data.deviceType}${data.requestId}${data.tenantId}${data.timestamp}${data.userId}${data.version}${data.secretKey}`, 'hex').toUpperCase()
  }
}

export default new RequestService()