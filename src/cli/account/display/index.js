const chalk = require('chalk');
const shell = require('shelljs');
const { cli, action } = require('core/cli');
const { getTopRunningChains } = require('core/forge-process');
const { execute, run } = require('./display');

cli('account <address>', 'Get an account info by address', input => action(execute, run, input), {
  requirements: {
    forgeRelease: false,   //要有运行的节点
    runningNode: true,     //要有rpc客户端
    rpcClient: true,       //判断有没有钱包（有没有都可以）
    wallet: args => {
      if (args && args[0] === 'me') {
        return true;
      }
      return false;
    },
    currentChainRunning: true,       //需要现在有运行着的链
    chainName: getTopRunningChains,  //并提供运行链的第一个的名字
  },
  options: [],
  handlers: {   //举例子帮助用户输入命令行指令
    '--help': () => {
      shell.echo(`
Examples:
  - ${chalk.cyan('forge account me')}                     Show account state for current wallet
  - ${chalk.cyan('forge account zyquEMz5kiVu78SF1')}      Show account state for specified address
        `);
    },
  },
});
