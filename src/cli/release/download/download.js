/* eslint-disable no-restricted-syntax */
const fs = require('fs');
const chalk = require('chalk');
const emoji = require('node-emoji');
const {
  getForgeDistribution, //得到当前forge所在的操作系统
  getOsAsync,
  print,
  printError,
  printInfo,
  warningUnSupportedOS,
} = require('core/util');
const { createAsset, download, formatVersion, DOWNLOAD_FLAGS } = require('./libs/index');

const { DEFAULT_MIRROR, RELEASE_ASSETS } = require('../../../constant');

// eslint-disable-next-line consistent-return
async function main({ args: [userVersion], opts: { mirror = DEFAULT_MIRROR, releaseDir, force } }) {
  try {
    const platform = await getForgeDistribution();
    const osInfo = await getOsAsync();
    printInfo(`Detected platform is: ${osInfo.dist}`);
    warningUnSupportedOS(osInfo.dist);  //检查不合法的操作系统

    if (releaseDir && fs.existsSync(releaseDir)) {
      // fs.existsSync(文件) 文件存在返回true，不存在返回false
      printInfo(`${chalk.yellow(`Using local releaseDir: ${releaseDir}.`)}`);
    }

    const { version, isLatest } = await formatVersion(userVersion);
    // 从用户输入的版本信息得到 规范格式的版本version以及该版本是否是最新版本
    const asset = createAsset({
      version,
      mirror: releaseDir || mirror,
      platform,
    });

    const downloadResult = await download(asset, {
      whitelistAssets: RELEASE_ASSETS,
      force,
      isLatest,
    });

    if (downloadResult !== DOWNLOAD_FLAGS.SUCCESS) {
      process.exit(1);
    }

    print();
    print(`${emoji.get('tada')} Congratulations! forge v${version} download successfully!`);
    printInfo(
      `Now you can use this version with ${chalk.cyan(
        `forge use ${version}`
      )}: requires reset chain state`
    );
    printInfo(
      `Or you can upgrade to this version with ${chalk.cyan(
        'forge upgrade'
      )}: does not require reset chain state`
    );
    print();
  } catch (err) {
    printError(err);
    printError('Forge release download failed, please try again later');
  }
}

exports.run = main;
exports.execute = main;
