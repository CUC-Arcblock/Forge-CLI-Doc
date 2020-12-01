const shell = require('shelljs');
const chalk = require('chalk');
const { cli, action } = require('core/cli');
const { getTopRunningChains } = require('core/forge-process');
const { execute, run } = require('./display');
//使用tx 具体交易哈希值来获取并显示一个交易的细节
cli('tx [hash]', 'Get a tx detail and display', input => action(execute, run, input), {
  requirements: {
    forgeRelease: false,
    runningNode: true,
    rpcClient: true,
    wallet: false,
    chainName: getTopRunningChains,
    currentChainRunning: true,
  },
  options: [],
  handlers: {
    '--help': () => {
      shell.echo(`
Examples:
  - ${chalk.cyan('forge tx HASH')}      Query and display TX with hash HASH
        `);
    },
  },
});
