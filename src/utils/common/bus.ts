import Vue from 'vue'

export enum BUS_MSG_TYPE {
  GET_INSTANCE_LIST = 'GET_INSTANCE_LIST',
  CLOSE_CLIETN = 'CLOSE_CLIETN',
  QUERY_RUNING_TASK = 'QUERY_RUNING',
  RUNING_TASK_RST = 'RUNING_TASK_RST',
}

const vueInstance = new Vue()

export default vueInstance