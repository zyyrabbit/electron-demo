<!--
 * @Description: fun desc of file
 * @Date: 2020-01-06 16:40:56
 * @Author: Lemon
 * @LastEditors  : Lemon
 * @LastEditTime : 2020-01-07 20:05:25
 -->
<template>
  <div id="app" :class="[theme]">
    <el-alert v-if="isNetExp" show-icon type="error" title="网络异常，请检查网络情况" :closable="false"></el-alert>
    <router-view />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component } from 'vue-property-decorator'
import { UpdaterType } from '@/services/updater/common'

@Component
export default class App extends Vue {
  private $IPC: any
  private $message: any
  private $alert:any
  private isNetExp: boolean = false
  private theme = ''
  private $confirm: any
  private $router: any

  created () {
    this.checkForUpdate()
    this.theme = __REGION
  }

  checkForUpdate() {
    this.$IPC.send(UpdaterType.CHECK)
    this.$IPC.only(UpdaterType.AVAILABLE, () => {
      this.$confirm('xxxxxx有更新啦！', '提示', {
        confirmButtonText: '立即更新',
        cancelButtonText: '取消',
        showClose: true,
        type: 'warning',
        closeOnClickModal: false,
        beforeClose: (action: string, instance: any, done: Function) => {
          if (action === 'confirm') {
            instance.$el.style.display = 'none'
            setTimeout(() => {
              this.$IPC.send(UpdaterType.DOWNLOAD_UPDATE)
              this.$router.push({ name: 'updater'})
              this.$IPC.send('resize', { width:400, height: 90 } )
            }, 30)
          }
          done()
        },
      })
    })
  }
}
</script>

<style>
#app{width: 100%;height: 100%;}
.el-popup-parent--hidden{padding-right: 0 !important;}
</style>