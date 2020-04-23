
declare module 'vue/types/vue' {
  import { AxiosInstance } from 'axios';
  import { RenderIPC } from '@/services/ipc/common';
  interface Vue {
    $http: AxiosInstance;
    $message: any;
    $IPC: RenderIPC;
  }
}

declare module '*.vue' {
  import Vue from 'vue';
  export default Vue;
}