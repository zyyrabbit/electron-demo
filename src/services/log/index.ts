import {
  FileLogService,
  ConsoleLogService
} from './LogService'
import { environment } from '@/services/environment/common'

const logService = __DEV ? 
  new ConsoleLogService(console.log) : 
  new FileLogService( { filePath: environment.dataPath })

export default logService