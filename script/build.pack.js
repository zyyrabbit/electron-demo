const path = require('path')
const fs = require('fs-extra')
const builder = require('electron-builder')
const yargs = require('yargs')
const moment = require('moment')
const { getAppUpdatePublishConfiguration } = require('app-builder-lib/out/publish/PublishManager')
const serializeToYaml = require('js-yaml')
const Platform = builder.Platform
let { dir, prepack, arch='x64', region, debug } = yargs.argv

if (process.env['APP_REGION']) {
  region = process.env['APP_REGION']
}

const EnvInfo = require(`../app/${region}/env.js`)

arch = 'ia32'
const Bit = 'ia32'
const Time = moment().format('YYYYMMDDHHmmss')

const commonConfig = {
  appId: `com.demo.${EnvInfo.name}`,
  productName: EnvInfo.name,
  directories: {
    output: 'build',
    app: `app/${region}`
  },
  files: [
    'dist/**/*',
    '!node_modules/'
  ],
  publish: [
    {
      provider: 'generic',
      url: EnvInfo.feedUrl
    }
  ],
}

if (debug) {
  commonConfig.asar = false;
}

function buildWindowsOptions () {
  const options = {}
  options.targets = Platform.WINDOWS.createTarget(dir ? 'dir' : 'nsis', builder.Arch[arch])
  options.config = {
    ...commonConfig,
    win: {
      icon: `build/icons/${region}/icon.ico`,
      requestedExecutionLevel: 'requireAdministrator'
    },
    nsis: {
      allowToChangeInstallationDirectory: true,
      artifactName: '${productName}_${version}_' + Bit + '_' + Time + '_Setup' + '_' + region + '.${ext}',
      oneClick: false, // 是否一键安装
      perMachine: true, 
      installerLanguages: 'zh_CN',
      deleteAppDataOnUninstall: true,
      menuCategory: EnvInfo.nameCN,
      shortcutName: EnvInfo.nameCN, // 图标名称
      uninstallDisplayName: EnvInfo.nameCN
    },
    afterPack: async (context) => {
      // 修复target == dir时 ，不能自动生成app-update.yml 更新文件的问题
      if (dir) {
        const packager = context.packager
        const publishConfig = await getAppUpdatePublishConfiguration(packager, context.arch, true);
        if (publishConfig != null) {
          await fs.writeFile(
            path.join(packager.getResourcesDir(context.appOutDir), 'app-update.yml'), 
            serializeToYaml.safeDump(publishConfig, {
              lineWidth: 8000,
              skipInvalid: false,
              noRefs: false
            })
          );
        }
      }
    },
    afterAllArtifactBuild: async (context) => {}
  }

  if (prepack) {
    options.prepackaged = 'build/win-ia32-unpacked'
  }

  return options
}

function getOptions () {
  switch (process.platform) {
    case 'win32':
      return buildWindowsOptions()
  }
}

builder.build(getOptions())
  .then(() => {
    console.log('Build OK!')
  })
  .catch(e => {
    console.error(e)
  })
