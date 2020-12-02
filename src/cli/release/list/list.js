const chalk = require('chalk');
const semver = require('semver');
const { print, printInfo, printError, highlightOfList } = require('core/util');
const debug = require('core/debug')('list');
const { getGlobalForgeVersion } = require('core/forge-fs');
const { listReleases } = require('core/libs/common');

async function main() {
  try {
    const globalVersion = getGlobalForgeVersion();
    debug('global version:', globalVersion);

    const releases = (await listReleases()) || [];
    // listReleases()列举的是符合操作系统的forge版本
    if (releases.length === 0) {
      printInfo(`Forge releases not found, please run ${chalk.cyan('forge install')} first`);
    } else {
      print('Installed:');
      // 循环遍历本地forge版本，如果是官方支持的forge版本，则将其打印
      releases.forEach(({ version }) => {
        highlightOfList(
          () =>
            semver.valid(version) &&
            semver.valid(globalVersion) &&
            semver.eq(version, globalVersion),
          version
        );
      });
    }
  } catch (err) {
    printError(err);
    printError(
      `Cannot list installed forge releases, ensure you have run ${chalk.cyan(
        'forge download'
      )} first`
    );

    process.exit(1);
  }
}

exports.run = main;
exports.execute = main;
