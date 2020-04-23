
declare module 'electron' {
  import { Logger } from '@/services/log/LogService';
  import { MainIPC } from '@/services/ipc/common';
  import { BrowserWindow } from 'electron';
  interface App {
    $IPC: MainIPC;
    $win: BrowserWindow;
    $log: Logger;
  }
}