const shell = require('shelljs');
const chalk = require('chalk');
const { cli, action } = require('core/cli');
const { execute, run } = require('./web');
//使用web none（无参数）/open/help 来开启正在运行的forge链/节点的web交互管理界面。
cli(
  'web [action]',
  'Open the web interface of running forge chain/node',
  input => action(execute, run, input),
  {
    requirements: {
      forgeRelease: false,
      runningNode: false,
      rpcClient: false,
      wallet: false,
      chainName: false,
      currentChainRunning: false,
    },
    handlers: {
      '--help': () => {
        //例如用open -c 链名来用默认浏览器打开具体的web管理界面
        shell.echo(`
Examples:
  - ${chalk.cyan(
    'forge web open'
  )}           start web server and open admin panel in default browser
  - ${chalk.cyan(
    'forge web open -c <chain name>'
  )}           open specified chain admin panel in default browser
        `);
      },
    },
  }
);
