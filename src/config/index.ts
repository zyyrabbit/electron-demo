export default class Config {
  public static readonly appName = __APP_NAME
  public static readonly appNameCN = __APP_NAME_CN
  public static readonly env: string = 'production'
  public static readonly version: string = __APP_VERSION
  public static readonly versionCode: number = __APP_VERSION_CODE
  public static readonly region: string = __REGION

  public static readonly apiHost: string = __API_HOST
  public static readonly secret: string = '5f23dc0ee5438ad8'
}
