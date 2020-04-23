import request from '@/services/request/renderRequestService'

export class AuthService {
  private _profile: any = {}

  public get profile() {
    return this._profile
  }

  async login (data: any) {
    const requestData: any = {}
  
    // 图形验证码
    if (data.captchaCode) {
      requestData.captchaCode = data.captchaCode
    }
    
    /* const response = await request.api.post('xxxxxxx', requestData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }) */

    return this.dispatchLogin({})
  }

  public getCaptchaUrl (data: any): string {
    return ''
  }

  dispatchLogin (response: any): any {
    this._profile = {}
  
    request.setAuthData(this._profile)
  
    return this._profile
  }

  public cleanAuthData () {
    this._profile = null
    request.setAuthData(null)
  }

}

export default new AuthService()