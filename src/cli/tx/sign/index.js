// eslint-disable-next-line import/no-unresolved
const { cli, action } = require('core/cli');
const { execute, run } = require('./sign');
//使用tx:sign命令来对一个交易进行签名，这需要参考发送者的钱包
cli(
  'tx:sign',
  'Sign a transaction (base64) according to sender’s wallet',
  input => action(execute, run, input),
  {
    requirements: {
      forgeRelease: true,
      runningNode: true,
      rpcClient: true,
      wallet: true,
    },
    options: [],
  }
);
