// eslint-disable-next-line import/no-unresolved
const { cli, action } = require('core/cli');
const { getTopRunningChains } = require('core/forge-process');
const { execute, run } = require('./list');
//使用tx:ls来列出最近发生的交易
cli('tx:ls', 'List latest transactions', input => action(execute, run, input), {
  requirements: {
    forgeRelease: true,
    runningNode: true,
    rpcClient: true,
    wallet: false,
    chainName: getTopRunningChains,
    currentChainRunning: true,
  },
  options: [],
});
