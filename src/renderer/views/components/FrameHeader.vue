<!--
 * @Description: fun desc of file
 * @Date: 2019-12-31 16:22:57
 * @Author: Lemon
 * @LastEditors  : Lemon
 * @LastEditTime : 2020-01-19 15:16:07
 -->
<template>
  <header class="frame-header" :class="hasborder?'frame-header-hasBorder':''">
    <div class="frame-header-ctrl">
      <button  @click="action('minimize')" class="frame-header-ctrl__icon iconfont" title="最小化">&#xe65a;</button>
      <button  @click="action('maximize')" v-if="maxAble && !isMaximized" class="frame-header-ctrl__icon iconfont" title="最大化">&#xe65d;</button>
      <button  @click="action('restore')" v-if="maxAble && isMaximized" class="frame-header-ctrl__icon iconfont" title="还原窗口">&#xe692;</button>
      <button  @click="action('close')" class="frame-header-ctrl__icon close iconfont" title="关闭窗口">&#xe642;</button>
    </div>
    <div class="frame-header-userinfo">
      <slot />
    </div>
    <div v-if="titlename" class="frame-header-title">
      <b class="ico ico-logoTitle"></b>
      {{titlename}}
    </div>
  </header>
</template>

<script lang="ts">
import {Vue, Component, Prop} from 'vue-property-decorator';
import { remote } from  'electron';

const win = remote.getCurrentWindow();
 @Component({name: 'frame-header'})
 export default class FrameHeader extends Vue {
  @Prop(Boolean) hasborder?: boolean;
  @Prop(Boolean) maxAble?: boolean;
  @Prop(String) titlename?: string;
  $IPC: any;
  $confirm: any;

  private isMaximized = win.isMaximized()

  async action(type: string) {
    if (type === 'maximize') {
      win.maximize();
      return;
    }
    if (type === 'restore') {
      win.restore();
      return;
    }
    if (type === 'minimize') {
      win.minimize();
      return;
    }
    if (type === 'close') {
      this.$emit('exit');
      return;
    }
  }

  mounted(){
    win.on('maximize', () => {
      this.isMaximized = true;
    });
    win.on('unmaximize', () => {
      this.isMaximized = false;
    });
  }
 }


</script>

<style lang="scss">
.frame-header-hasBorder {
  border-bottom: 1px solid #e2e2e2;
}
.frame-header {
  -webkit-app-region: drag;
  height: 50px;
  flex-shrink: 0;
  box-sizing: border-box;
  position: relative;
  &-title {
    font-size: 18px;
    color: #555;
    line-height: 50px;
    padding-left: 20px;
    height: 50px;
    overflow: hidden;
  }
  &-ctrl {
    float: right;padding:11px 11px 0 0;-webkit-app-region: no-drag;
    &__icon{width:28px;height: 28px;text-align: center;padding: 0;color: #777;border: none;;background-color: transparent;outline: none}
    &__icon:hover{background-color: #efefef}
    &__icon:active{background-color: #e3e3e3}
    &__icon:hover.close{background-color: #e81123;color: #fff}
  }
  &-userinfo {
    float: right;
    -webkit-app-region: no-drag;
  }
}
</style>
