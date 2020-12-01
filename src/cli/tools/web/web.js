/* eslint no-case-declarations:"off" */
const detectPort = require('detect-port');
const shell = require('shelljs');
const pm2 = require('pm2');

const { printError, printInfo, printWarning } = require('core/util');
const { getAllProcesses } = require('core/forge-process');

const { DEFAULT_CHAIN_NODE_PORT } = require('../../../constant');

const PM2_ID = 'arc-forge-web';

async function main({
  args: [action = 'none'],
  opts: { chainName = process.env.FORGE_CURRENT_CHAIN } = {},
}) {
  /* eslint-disable indent */
  //默认情况为无参数
  switch (action) {
    case 'none':
      //无参数时显示帮助
      shell.exec('forge web -h --color always');
      break;
    case 'open':
      let cName = chainName;

      // get first runing chain
      if (!cName) {
        const runingChains = await getAllProcesses();
        //若没有给出具体的链名将通过进程进行获取
        if (runingChains && runingChains.length > 0) {
          cName = runingChains[0].name;
        }
      }

      //定义浏览访问的函数，参数为链的网络和端口
      const openBrowser = (network, port) => {
        //设置端口与网络信息
        let url = `http://localhost:${port}`;
        if (network) {
          url += `?network=${network}`;
        }
        printInfo(`Opening ${url}`);
        //用默认浏览器打开该url进行访问
        shell.exec(`open ${url}`);
      };

      //用pm2部署浏览器，首先进行基础准备工作
      pm2.describe(PM2_ID, async (describeError, [info]) => {
        if (describeError) {
          throw describeError;
        }

        //检查网络环境，若无问题则进行访问
        if (info && info.pm2_env && info.pm2_env.status === 'online') {
          pm2.reload(PM2_ID, err => {
            if (err) {
              printWarning(err);
            }

            pm2.disconnect();
            //访问函数此时的参数为：链名，forge的web端口
            openBrowser(cName, info.pm2_env.env.FORGE_WEB_PROT);
          });
          return;
        }

        //检测端口，设置连接数据，开始连接
        const detectedProt = await detectPort(DEFAULT_CHAIN_NODE_PORT);
        pm2.start(
          {
            name: PM2_ID,
            script: './server.js',
            max_memory_restart: '100M',
            cwd: __dirname,
            env: {
              FORGE_WEB_PROT: detectedProt,
            },
          },
          err => {
            pm2.disconnect();

            if (err) {
              printError('Forge Web exited error', err);
              return;
            }

            printInfo(`Forge Web is listening on port ${detectedProt}`);
            openBrowser(cName, detectedProt);
          }
        );
      });

      break;
    default:
      break;
  }
  /* eslint-enable indent */
}

exports.run = main;
exports.execute = main;
exports.start = () => main({ args: ['start'] });
