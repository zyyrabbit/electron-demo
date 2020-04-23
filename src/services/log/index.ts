import {
  FileLogService,
  defaultConsoleLogService
} from './LogService'
export { Logger } from './LogService'
import { environment } from '@/services/environment/common'

const logService = __DEV ? defaultConsoleLogService : new FileLogService( { filePath: environment.dataPath })

export default logService