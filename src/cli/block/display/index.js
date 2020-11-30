const shell = require('shelljs');
const chalk = require('chalk');
const { cli, action } = require('core/cli');
const { getTopRunningChains } = require('core/forge-process');
const { execute, run } = require('./display');

cli(
  'block [height]',
  'Get the block info from the running node',
  input => action(execute, run, input),
  {
    requirements: {
      forgeRelease: false,      //forge在运行
      runningNode: true,        //要有运行着的节点
      rpcClient: true,          //要有rpc客户端
      chainName: getTopRunningChains,   //提供运行链的第一个的名字
      currentChainRunning: true,        //需要现在有运行着的链
    },
    options: [   //命令行[options]部分可以适用以下两条指令
      ['-d, --show-txs', 'Show transaction details'],
      ['-f, --stream', 'Streaming new blocks on the chain'],
    ],
    handlers: {   //举例子帮助用户输入命令行指令
      '--help': () => {
        shell.echo(`
Examples:
  - ${chalk.cyan('forge block')}                display latest block, txs not printed
  - ${chalk.cyan('forge block -f')}             Streaming for new blocks generated
  - ${chalk.cyan('forge block --show-txs')}     display latest block, txs printed
  - ${chalk.cyan('forge block 123')}            display block at height 123
  - ${chalk.cyan('forge block last')}           display latest block
  - ${chalk.cyan('forge block first')}          display first block
  - ${chalk.cyan('forge block 123,456')}        display 2 blocks
  - ${chalk.cyan('forge block 1...4')}          display block from height 1,2,3,4
        `);
      },
    },
  }
);
