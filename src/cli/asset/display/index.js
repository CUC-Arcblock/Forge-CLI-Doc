const chalk = require('chalk');
const shell = require('shelljs');
const { cli, action } = require('core/cli');
const { getTopRunningChains } = require('core/forge-process');

const { execute, run } = require('./display');

cli('asset <address>', 'Get asset info by address', input => action(execute, run, input), {
  requirements: {
    forgeRelease: false,  //forge在运行
    runningNode: true,    //要有运行着的节点
    rpcClient: true,      //要有rpc客户端
    wallet: false,        //判断有没有钱包（有没有都可以）
    chainName: getTopRunningChains, //提供运行链的第一个的名字
    currentChainRunning: true,      //需要现在有运行着的链
  },
  options: [],
  handlers: {   //举例子帮助用户输入命令行指令
    '--help': () => {
      shell.echo(`
Examples:
  - ${chalk.cyan('forge asset zyquEMz5kiVu78SF1')}      Show asset state for specified address
        `);
    },
  },
});
