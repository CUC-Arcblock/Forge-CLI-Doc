// eslint-disable-next-line import/no-unresolved
const { cli, action } = require('core/cli');
const { execute, run } = require('./send');
//使用tx:send来把经过签名的交易发向整个网络
cli('tx:send', 'Send a signed tx to the network', input => action(execute, run, input), {
  requirements: {
    forgeRelease: true,
    runningNode: true,
    rpcClient: true,
    wallet: true,
  },
  options: [],
});
