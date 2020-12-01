const chalk = require('chalk');
const semver = require('semver');

const { isForgeStarted } = require('core/forge-process');
const { updateReleaseYaml, getGlobalForgeVersion } = require('core/forge-fs');
const { checkSatisfiedForgeVersion, listReleases } = require('core/libs/common');
const { printError, printSuccess, printWarning } = require('core/util');

const { version: cliVersion, engines } = require('../../../../package.json');
 // "version": "1.3.0",    engines : "forge": ">=0.32.0"
// eslint-disable-next-line consistent-return
async function main({ args: [userVersion], opts: { allowMultiChain = false } }) {
  try {
    if (!semver.valid(userVersion)) {  // 输入版本不规范
      printError(
        `Please input a valid version, run ${chalk.cyan('forge ls')} to check the local versions.`
      );
      process.exit(1);
    }

    if (!checkSatisfiedForgeVersion(userVersion, engines.forge)) {
       // 查看userVersion是否在engines.forge这个所匹配的范围内
       // 缺省情况下，engines.forge ： ">=0.32.0"
      printError(
        `forge-cli@${cliVersion} requires forge@${engines.forge} to work, but got ${userVersion}!`
      );
      process.exit(1);
    }

    const version = semver.clean(userVersion);
     // semver.clean('  =v1.2.3   ') // '1.2.3'
    const globalVersion = getGlobalForgeVersion();  //  通过配置文件读取到的当前的forge版本信息
    if (semver.valid(globalVersion) && semver.eq(version, globalVersion)) {
      // userVersion就是当前正在使用的forge版本
      printWarning(`Already using forge release v${version}`);
      return process.exit(0);
    }

    if (allowMultiChain === false) {
      // 不允许多链同时运行的时候
      if (await isForgeStarted()) {
        printWarning('Please stop forge before activate another version');
        return process.exit(1);
      }
    }

    const releases = await listReleases();  // 列举本地已经下载的forge，并检查要使用的版本是否已经下载
    if (!releases.find(item => semver.eq(version, item.version))) {
      printError(
        `forge release v${version} not downloaded, please download it with ${chalk.cyan(
          `forge download ${version}`
        )}`
      );
      return process.exit(1);
    }

    updateReleaseYaml('forge', version);  //  在运行userVersion之前修改配置文件中的当前正在运行的版本信息

    printSuccess(`Forge v${version} activated successfully!`);
  } catch (err) {
    printError(err);
    printError('Forge release activate failed');
  }
}

exports.run = main;
exports.execute = main;
