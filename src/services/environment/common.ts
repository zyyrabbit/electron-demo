

import os from 'os'
import { execSync } from 'child_process'
import Config from '@/config'
import { app } from 'electron'
import path from 'path'
import fs from 'fs-extra'
export enum OSType {
  LINUX = 10,
  LINUX_X64 = 11,
  WINDOWS = 15,
  ANDROID = 20,
  IOS = 25,
  MACOS = 30
}

export enum DeviceType {
  THIN_CLIENT = 10,
  THIN_CLIENT_X86 = 11,
  PC = 25,
  MAC = 45
}

export enum APPModel {
  TOB = 'TOB',
  TOC = 'TOC'
}

function getWindowsGuid (): string {
  // 兼容64位系统
  // https://github.com/automation-stack/node-machine-id/issues/6
  let is64 = false
  try {
    is64 = !!fs.statSync('C:\\windows\\sysnative')
  } catch(e) { }

  const stdout = execSync(`C:\\windows\\${is64 ? 'sysnative' : 'system32'}\\reg query HKLM\\SOFTWARE\\Microsoft\\Cryptography /v MachineGuid | findstr MachineGuid`)
  const data = stdout.toString().trim().split(/\s+/)
  return data[2]
}

function getMacGuid (): string {
  const stdout = execSync('system_profiler SPHardwareDataType | grep "Hardware UUID"')
  const data = stdout.toString().trim().split(/:/)
  return data[1]
}

function getLiunxGuid (): string {
  let id = ''

  try {
    const stdout = execSync('cat /proc/cpuinfo | grep Serial | awk \'{print $3}\'')
    id = stdout.toString().trim()
  } catch (e) {}
  
  // 实达盒子没有上述的字段， 改为获取第一个非lo网卡的地址
  if (id === '') {
    let networks = os.networkInterfaces()
    for (let key in networks) {
      if (key === 'lo') {
        continue
      }

      id = networks[key][0].mac
      break
    }
  }

  return id
}

function getWindowsVersion (): string {
  const stdout = execSync('reg query "HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion" /v ProductName | findstr ProductName')
  const data = stdout.toString().trim().split(/\s+/)
  return data[2]
}

function getMacOSVersion (): string {
  const stdout = execSync('sw_vers')
  const res = stdout.toString().split(/\n/).slice(0, 2).map((line): string => {
    return line.split(':')[1].trim()
  })
  
  return res.join(' ')
}

function getLinuxVersion (): string {
  if (process.env['SYSTEM_VERSION']) {
    return process.env['SYSTEM_VERSION']
  }

  return 'linux'
}


export class Environment {
  private cache = new Map<string, any>()

  protected getCache (key: string): any {
    return this.cache.get(key)
  }

  protected setCache (key: string, data: any): void {
    this.cache.set(key, data)
  }

  protected resolveCache (key: string, fn: () => any) {
    if (this.getCache(key)) {
      return this.getCache(key)
    }

    const val = fn()
    this.setCache(key, val)
    return val
  }

  public get APIHost (): string {
    return Config.apiHost
  }

  public get region (): string {
    return Config.region
  }

  public get hostName (): string {
    return os.hostname()
  }

  public get appModel (): APPModel {
    return APPModel.TOB
  }

  public get appVersion (): string {
    return Config.version
  }

  public get appName (): string {
    return Config.appName
  }

  public get appNameCN (): string {
    return Config.appNameCN
  }

  public get appVersionCode (): number {
    return Config.versionCode
  }

  public get appPath (): string {
    return app.getAppPath()
  }

  public get dataPath (): string {
    const dir = path.join(app.getPath('userData'), 'Data')
    fs.ensureDirSync(dir)
    return dir
  }

  public get deviceCode (): string {
    return this.resolveCache('deviceCode', (): string => {
      switch (process.platform) {
        case 'win32':
          return getWindowsGuid()
        case 'darwin':
          return getMacGuid()
        case 'linux':
          return getLiunxGuid()
        default: 
          return ''  
      }
    })
  }

  public get deviceType (): DeviceType {
    return this.resolveCache('deviceType', (): DeviceType => {
      const val: DeviceType = 105 // 100暂时测试 105正式
      return val
    })
  }

  public get deviceName (): string {
    return this.resolveCache('deviceName', (): string => {
      const info = os.userInfo()
      const model = this.deviceModel

      return `${info.username}的${model}`
    })
  }

  public get deviceModel (): string {
    return this.resolveCache('deviceModel', (): string => {
      switch (process.platform) {
        case 'win32':
          return 'PC'
        case 'darwin':
          return 'Mac'
        default:
          return 'Linux'
      }
    })
  }

  public get OSVersion (): string {
    return this.resolveCache('OSversion', (): string => {
      switch (process.platform) {
        case 'win32':
          return getWindowsVersion()
        case 'darwin':
          return getMacOSVersion()
        default:
          return getLinuxVersion()
      }   
    })
  }

  public get deviceInfo (): string {
    const cpus = os.cpus()
    const model = cpus[0].model
    const core = cpus.length

    return `${model} ${core}core`
  }

  public get OSType (): OSType {
    return this.resolveCache('OSType', (): OSType => {
      switch (process.platform) {
        case 'win32':
          return OSType.WINDOWS
        case 'darwin':
          return OSType.MACOS
        default:
          return OSType.LINUX
      }   
    })
  }

  public get OSBit (): number {
    const val = os.arch()
    return /64/.test(val) ? 64 : 32
  }
}

export const environment =  new Environment()

