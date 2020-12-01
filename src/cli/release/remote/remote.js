const semver = require('semver');
const { fetchAsset, print, printError, printWarning, highlightOfList } = require('core/util');
const { getLocalVersions } = require('core/libs/common');
const forgeVersion = require('core/forge-version');

const { ASSETS_PATH, DEFAULT_MIRROR } = require('../../../constant');

const printList = (list = [], localVersions = []) => {
  // 检查如果list中的元素在localVersions中，则高亮打印，否则普通打印
  if (list.length === 0) {
    printWarning('Forge releases not found.');
  } else {
    print('Forge releases:');
    list.forEach(x =>
      highlightOfList(() => localVersions.find(localVersion => semver.eq(localVersion, x)), x)); // prettier-ignore
  }
};

const main = async ({ opts: { mirror = DEFAULT_MIRROR } }) => {
  try {
    const versionsInfo = await fetchAsset(ASSETS_PATH.VERSIONS, mirror);//得到远程的所有forge版本

    // 将versionsInfo 过滤掉status为未定义的或者是normal的，再以[x => x.version]为值构造map，
    // 并按照从大到小进行排序
    const versions = versionsInfo
      .filter(x => x.status === undefined || x.status === 'normal')
      .map(x => x.version)
      // map() 方法创建一个新数组，其结果是该数组中的每个元素是调用一次提供的函数后的返回值。
      .sort((x, y) => {
        if (forgeVersion.gt(x, y)) {
          // x > y : 返回1
          return 1;
        }
        if (forgeVersion.lt(x, y)) {
          // x < y : -1
          return -1;
        }
        return 0;
      });

    const localVersions = await getLocalVersions(); // 得到所有符合当前操作系统的forge版本信息

    printList(versions, localVersions); // 如果versions中的元素在localVersions（已安装列表）中，则高亮该版本信息，否则普通打印
  } catch (error) {
    printError(error);
  }
};

exports.run = main;
