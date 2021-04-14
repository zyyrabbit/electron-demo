import moment from 'moment'
import path  from 'path'
import os  from 'os'
import fs from 'fs-extra'
const serialize = require('serialize-to-js')
const DAYS = 3

export const IPCLOG = 'IPCLOG';
export interface LogOption {
  logLevel?: LogLevel, 
  days?: number,
  filePath: string,
  extname?: string
}

export interface UploadData {
	account: string
}

export interface Logger {
	getLevel(): LogLevel
	setLevel(level: LogLevel): void
	trace(...args: any[]): void
	debug(...args: any[]): void
	info(...args: any[]): void
	warn(...args: any[]): void
	error(...args: any[]): void
	critical(...args: any[]): void
	upload(data: UploadData): Promise<void>
}

export enum LogLevel {
	Trace,
	Debug,
	Info,
	Warning,
	Error,
	Critical,
	Off
}

export function now(format: string = 'YYYY-MM-DD HH:mm:ss.SSS'): string {
	return moment().format(format)
}

export abstract class AbstractLoggerService {
	private level: LogLevel = LogLevel.Info

	public setLevel(level: LogLevel): void {
		this.level = level
	}

	public getLevel(): LogLevel {
		return this.level
	}

	public async upload (data: UploadData): Promise<void> {}
}


export class FileLogService extends AbstractLoggerService implements Logger {
  private stdout: fs.WriteStream
  private today: string
  private days: number
  private extname = ''
  private filePath = ''

  public constructor (logOption: LogOption) {
    super()
    const {
      logLevel= LogLevel.Info, 
      days = DAYS,
      filePath = '',
      extname = '.log'
    } = logOption
    this.today = now('YYYY-MM-DD')
    this.days = days
    this.extname = extname
    this.filePath = filePath

    this.setLevel(logLevel)
    this.clean()
   
    this.stdout = fs.createWriteStream(this.getLogFile(this.today), {
      flags: 'a+'
    })
  }

  public trace(...args: any[]): void {
		if (this.getLevel() <= LogLevel.Trace) {
      this.write(LogLevel.Trace, this.format(...args))
		}
	}

	public debug(...args: any[]): void {
		if (this.getLevel() <= LogLevel.Debug) {
			this.write(LogLevel.Debug, this.format(...args))
		}
	}

	public info(...args: any[]): void {
		if (this.getLevel() <= LogLevel.Info) {
			this.write(LogLevel.Info, this.format(...args))
		}
	}

	public warn(...args: any[]): void {
		if (this.getLevel() <= LogLevel.Warning) {
			this.write(LogLevel.Warning, this.format(...args))
		}
	}

	public error(...args: any[]): void {
		if (this.getLevel() <= LogLevel.Error) {
			this.write(LogLevel.Error, this.format(...args))
		}
	}

	public critical(...args: any[]): void {
		if (this.getLevel() <= LogLevel.Critical) {
			this.write(LogLevel.Critical, this.format(...args))
		}
  }

  /**
   * 清除过期日志
   */
  private clean (): void {
    const dir = this.getLogFile()
    fs.readdir(dir)
      .then((files): void => {
        files.forEach((file): void => {
          const date = path.basename(file, this.extname)
          // 需要过滤非日志文件
          if (!/\d{4}-\d{1,2}-\d{1,2}/.test(date)) {
            return
          }
          if (moment(date).add(this.days, 'day').isBefore(this.today, 'day')) {
            fs.remove(path.join(dir, file))
          }
        })
      })
  }

  private getLogFile (date?: string): string {
    if (date) {
      return path.join(this.filePath, 'Log', date + this.extname)
    }
    
    const dir = path.join(this.filePath, 'Log')
    fs.ensureDirSync(dir)

    return dir
  }

  private write (level: LogLevel, message: string): void {
    const today = now('YYYY-MM-DD')

    if (today !== this.today) {
      this.today = today
      this.stdout.close()
      this.stdout = fs.createWriteStream(this.getLogFile(this.today), {
        flags: 'a+'
      })
    }

    this.stdout.write(`[${moment(Date.now()).format('HH:mm:ss:SSS')}]`)
    switch (level) {
      case LogLevel.Debug:
        this.stdout.write('[Debug]')
        break
      case LogLevel.Warning:
        this.stdout.write('[Warning]')
        break
      case LogLevel.Error:
        this.stdout.write('[Error]')
        break
      case LogLevel.Trace:
        this.stdout.write('[Trace]')
        break
      case LogLevel.Critical:
        this.stdout.write('[Critical]')
        break
      case LogLevel.Info:
      default:
        this.stdout.write('[Info]')
        break  
    }

    this.stdout.write(message)
    this.stdout.write(os.EOL)
  }

  private format (...args: any[]): string {
    return args.map((arg): string => {
      try {
        switch (typeof arg) {
					case 'string':
						return arg
				}
        return serialize(arg)
      } catch (e) {
        return ''
      }
    }).join(' ')
  }

  private dispose (): void {
    this.stdout.end()
  }

}


export class ConsoleLogService extends AbstractLoggerService implements Logger {
  private _write: Function
	public constructor (write: Function, logLevel: LogLevel = LogLevel.Info) {
    super()
    this._write = write;
		this.setLevel(logLevel)
  }
  
  public write(level: string, args: any[]) {
    // [${level} ${moment(Date.now()).format('HH:mm:ss')}]
    // @ts-ignore
    this._write(`${level.toLowerCase()}`, ...args);
  }

	public trace(...args: any[]): void {
		if (this.getLevel() <= LogLevel.Trace) {
			this.write('TRACE', args)
		}
	}

	public debug(...args: any[]): void {
		if (this.getLevel() <= LogLevel.Debug) {
      this.write('DEBUG', args)
		}
	}

	public info(...args: any[]): void {
		if (this.getLevel() <= LogLevel.Info) {
			this.write('INFO', args)
		}
	}

	public warn(...args: any[]): void {
		if (this.getLevel() <= LogLevel.Warning) {
			this.write('WARN', args)
		}
	}

	public error(...args: any[]): void {
		if (this.getLevel() <= LogLevel.Error) {
			this.write('ERR', args)
		}
	}

	public critical(...args: any[]): void {
		if (this.getLevel() <= LogLevel.Critical) {
			this.write('CRITI', args)
		}
	}
}


