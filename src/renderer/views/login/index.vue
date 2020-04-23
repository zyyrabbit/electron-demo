<template>
  <div class="frame-wraper">
    <frame-header :hasborder='false' :maxAble="false" @exit="exit"/>
    <section class="frame-content">
      <div class="page-login">
        <b class="ico ico-logoLarge"></b>
        <h2>登录页</h2>

        <el-form ref="form" :model="form" class="login-form" :rules="rules">
          <el-form-item prop="name">
            <el-input ref="usernameInput" v-model="form.name" @input="handleInput">
              <span slot="prepend">帐号</span>
            </el-input>
          </el-form-item>
          <el-form-item  prop="password">
            <el-input v-model="form.password" show-password clearable type="password">
              <span slot="prepend">密码</span>
            </el-input>
          </el-form-item>

          <el-form-item v-if="captcha">
            <img :src="captchaUrl" @click="refreshCaptchaUrl" class="code-img" alt="点击切换验证码" />
            <div class="codeVer">
              <el-input v-model="form.code">
                <span slot="prepend">验证码</span>
              </el-input>
            </div>
          </el-form-item>

          <el-form-item>
            <el-checkbox label="记住密码" name="type" v-model="remember"></el-checkbox>
          </el-form-item>
          <el-form-item>
            <el-button :loading="loading" class="btnLogin" type="primary" @click="submit">登 录</el-button>
          </el-form-item>
        </el-form>
      </div>
    </section>
    <div class="app-version">v{{appVersion}}</div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import config from '@/config'
import auth from '@/services/auth/renderAuthService'
import { AUTH } from '@/services/auth/common'
import { encode, decode, md5 } from '@/utils/node/crypto'
import { APIErrorCode, APIError } from '@/services/request/common'
import FrameHeader from '@/renderer/views/components/FrameHeader.vue'
import bus, { BUS_MSG_TYPE } from '@/utils/common/bus'
import { remote } from  'electron'
import { UpdaterType } from '@/services/updater/common'
import { environment } from '@/services/environment/common'
const win = remote.getCurrentWindow()
interface Account {
  name: string
  password: string
}

const SECRET = config.secret
const CIPHER = 'aes-128-cbc'
const IV = '816ca54263f54f15'
const STORE_KEY =  __REGION + '-accounts' // 解决不同环境造成的账号冲突

function encryptionPassword(password: string): string {
  return encode(
    CIPHER,
    Buffer.from(password),
    SECRET,
    IV
  ).toString('base64')
}

function decryptionPassword(code: string): string {
  return decode(
    CIPHER,
    Buffer.from(code, 'base64'),
    SECRET,
    IV
  ).toString()
}

@Component({
  name: 'Login',
  components: {
    FrameHeader
  }
})
export default class Login extends Vue {
  accounts: Account[] = []
  accountIndex = 0
  form = {
    name: '',
    password: '',
    md5Password: '',
    code: ''
  }
  passwordVisible = false
  appVersion = environment.appVersion
  captchaUrl = 'about:blank'
  captcha = false
  remember = false
  loading = false
  error = ''
  isConnected = false
  $message: any
  $router: any
  $IPC: any
  $refs: any
  $confirm: any

  rules = {
    name: [
      { required: true, message: '请输入账号', trigger: 'blur' },
    ],
    password: [
      { required: true, message: '请输入密码', trigger: 'blur' }
    ],
  }

  mounted() {
    this.handleEntry()
    this.getAccounts()
    this.$nextTick(() => {
      this.$refs.usernameInput.focus()
    })
  }

  getAccounts (): void {
    const accounts = localStorage.getItem(STORE_KEY)

    if (accounts) {
      this.accounts = JSON.parse(accounts)
      if (this.accounts.length > 0) {
        this.selectAccount(this.accountIndex)
      }
    }
  }

  selectAccount (index: number): void {
    const account = this.accounts[index]
    if (!account) return
    this.form.name = account.name
    this.form.password = account.password ? decryptionPassword(account.password) : ''
    this.remember = this.accounts[0].password !== ''
  }

  handleInput () {
    if (this.form.name) {
      for (let account of this.accounts) {
        if (account.name === this.form.name) {
          this.form.password = account.password ? decryptionPassword(account.password) : ''
          return
        }
      }
    }
    this.form.password = ''
  }

  togglePasswordVisible (): void {
    this.passwordVisible = !this.passwordVisible
  }

  handleEntry (): void {
    const handler = (event: KeyboardEvent) => {
      switch (event.keyCode) {
        case 13:
          this.submit()
          break
      }
    }
    document.addEventListener('keypress', handler)
    this.$once('hook:beforeDestroy', () => {
      document.removeEventListener('keypress', handler)
    })
  }

  exit() {
    win.close()
  }
  
  async submit() {
    if (this.loading) return false

    this.loading = true

    if (!this.form.name.trim() || !this.form.password) {
      this.$message.error('请输入账号和密码')
      this.loading = false
      return
    }

    if (this.captcha && !this.form.code.trim()) {
      this.$message.error('请输入验证码')
      this.loading = false
      return
    }
    
    try {
      this.error = ''
      const res = await auth.login({
        username: this.form.name,
        password: md5(this.form.password, 'hex'),
        captchaCode: this.form.code
      })
      // 记住密码和账号
      const index = this.accounts.findIndex(
        (account): boolean => account.name === this.form.name
      )
      if (index > -1) {
        const [account] = this.accounts.splice(index, 1)
        account.password = this.remember ? encryptionPassword(this.form.password) : ''
        this.accounts.unshift(account)
      } else {
        this.accounts.unshift({
          name: this.form.name,
          password: this.remember ? encryptionPassword(this.form.password) : ''
        })
      }
      localStorage.setItem(STORE_KEY, JSON.stringify(this.accounts))
      this.$router.push({ name: 'home'})
    } catch (e) {
      if (e.code === APIErrorCode.NEED_CAPTCHA) {
        // 需要验证码
        this.captcha = true
      }
      if (this.captcha) {
        this.refreshCaptchaUrl()
      }
      this.$message.error(e.message)
    } finally {
      this.loading = false
    }
  }

  async refreshCaptchaUrl() {
    this.captchaUrl = await auth.getCaptchaUrl({
      width: 120,
      height: 40,
      userInfo: this.form.name
    })
  }

}
</script>

<style lang="scss">
.page-login {
  text-align: center;
  padding: 0 30px 0 30px;
  h2 {
    font-size: 16px;
    color: #333;
    height: 45px;
    line-height: 45px;
  }
  .login-form{text-align: left;padding-top:20px;
    .code-img{width: 100px;height:40px;float: right;cursor: pointer;}
    .codeVer{margin-right: 110px;}
  }
  .el-input-group__append, .el-input-group__prepend{background-color: #fff;font-size: 14px;color: #555}
  .btnLogin{width: 100%;height: 40px};
  .el-form-item__error {
    left: 70px;
  }
}
  .el-message-box {
    width: 350px!important;
  }
  .app-version {
    position: fixed;
    bottom: 4px;
    right: 4px;
    font-size: 13px;
    color: #F69A20;
    padding: 0 5px 5px 0;
  }
</style>

