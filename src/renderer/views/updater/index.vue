<template>
  <div class="update-progress">
    <div style="width: 90%">
      <div class="update-progress--title">{{message}}</div>
      <el-progress :percentage="percentage"></el-progress>
    </div>
  </div>
</template>
<script lang="ts">
import {Vue, Component, Prop} from 'vue-property-decorator';
import { UpdaterType } from '@/services/updater/common';

@Component({name: 'updater'})
  export default class Updater extends Vue {
    $IPC: any;
    percentage = 0;
    $router: any;
    message = '更新可能需要几分钟，请耐心等待......'

    created() {
      this.$IPC.only(UpdaterType.ERROR, () => {
        this.message = '更新过程中出错啦，请稍后重试......'
        setTimeout(() => {
          this.$router.push({
            name: 'login'
          });
          this.$IPC.send('resize',{ width: 370, height: 520 });
        }, 3000)
      })
      this.$IPC.only(UpdaterType.PROGRESS, (ProgressInfo: any) => {
        this.percentage = Math.floor(ProgressInfo.percent * 10) / 10;
      })
      this.$IPC.only(UpdaterType.DOWNLOADED, (ProgressInfo: any) => {
        this.$IPC.send(UpdaterType.INSTALL)
      })
    }

  }
</script>
<style lang="scss" scoped>
.update-progress {
  display: flex;
  justify-content: center;
  align-items: center;

  width: 100%;
  height: 100%;
  background-color: #ddd;
  color: #000;
  opacity: .5;
  -webkit-app-region: drag;
  &--title {
    text-align: center;
    color: #333;
    margin-bottom: 5px;
    font-size: 12px;
  }
}
</style>
