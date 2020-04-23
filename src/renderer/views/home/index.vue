<!--
 * @Description: fun desc of file
 * @Date: 2020-01-06 17:55:32
 * @Author: Lemon
 * @LastEditors  : Lemon
 * @LastEditTime : 2020-02-08 18:52:37
 -->
<template>
<div class="frame-wraper" ref="frameWraper">
  <frame-header :hasborder='true' :maxAble="true" titlename="客户端主页" @exit="exit">
    <el-dropdown @command="logout" trigger="click" class="account-info">
      <span class="el-dropdown-link">
        <el-avatar icon="el-icon-user-solid" :size="18" />
        <span class="account-info-text">张三</span>
        <i class="el-icon-caret-bottom"></i>
      </span>
      <el-dropdown-menu slot="dropdown" class="account-info-dropdown">
        <div class="account-info-detail">
          <el-avatar icon="el-icon-user-solid" :size="32" />
          <p>张三</p>
        </div>
        <el-dropdown-item command="logout" icon="iconfont icon-poweroff">退出登录</el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
  </frame-header>
  <section class="frame-content">
    <div class="page-home">
       主页内容
    </div>
  </section>
</div>
</template>

<script lang='ts'>
import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import debounce from '@/utils/common/debounce.js';
import FrameHeader from '@/renderer/views/components/FrameHeader.vue';
import auth from '@/services/auth/renderAuthService';
import { AUTH } from '@/services/auth/common';
import bus, { BUS_MSG_TYPE } from '@/utils/common/bus';
import { remote } from  'electron';

const win = remote.getCurrentWindow();

@Component({
  name: 'Home',
  components: {
    FrameHeader,
  }
})
export default class App extends Vue {
  userName = '';
  foldersHeight = 288;
  historyHeight = 210;
  $router: any;
  $IPC: any;
  $confirm: any;
  $refs: any;
  $message: any;
  loading = true;

  mounted() {
    setTimeout(() => {
      this.$IPC.send('resize', { resizable: true, minHeight: 600, minWidth:960 });
    }, 10);
  }

  async exit() { 
    this.doExit();
  }

  doExit() {
    win.hide();
    // 通知同步工具客户端断开连接
    this.$IPC.sendToClient('exit', { return: 0 });
    // 定时2s关闭程序
    setTimeout(() => { win.close(); }, 2000);
  }

  async logout() {
    this.$confirm('退出账号，当前传输任务可能会暂停', '确认信息', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      showClose: false,
      type: 'warning',
      beforeClose: async (action: string, instance: any, done: Function) => {
        instance.confirmButtonLoading = true;
          try {
              if (action === 'confirm') {
                await this.doLogout();
              }
            } catch(e) {
              console.error(e);
            } finally {
              instance.confirmButtonLoading = false;
              done();
            }
          }
        })
  }

  async doLogout(instance?: any) {
    // 清除登录数据
    auth.cleanAuthData();
    // 通知同步工具客户端断开连接
    this.$refs.frameWraper.style.display = 'none'
    instance && (instance.$el.style.display = 'none')
    setTimeout(() => {
      this.$IPC.send('resize', { width: 370, height: 520 });
      this.$router.push({
        name: 'login'
      });
    }, 30)
  }

}
</script>

<style lang="scss">
.el-avatar{background: #B7DAFF;}

.account-info{margin: 10px 20px 0 0;
  .el-avatar{vertical-align: middle;margin-right:3px;}
  &-text{display: inline-block;max-width:100px;color:#555;white-space: nowrap;overflow: hidden;text-overflow: ellipsis;vertical-align: middle;}
  &-text:hover{color:#000}
  &-dropdown{width: 166px}
  &-detail{text-align: center;font-size: 16px;color:#333;border-bottom: 1px solid #e9e9e9;margin: 0 12px 6px;padding: 5px 0 12px;word-break: break-all}
}
.page-home {
  width: 100%;
  height: 100%;
  overflow: hidden;
  padding: 20px;
  box-sizing: border-box;

  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}
</style>