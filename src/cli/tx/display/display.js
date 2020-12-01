const shell = require('shelljs');
const { createRpcClient } = require('core/env');
const debug = require('core/debug')('tx:display');
const { symbols, pretty } = require('core/ui');

async function execute({ args: [hash] }) {
  if (!hash) {
    //如果没有输入交易的hash值则显示帮助信息
    shell.exec('forge tx -h --color always');
    return;
  }
  try {
    ////当hash值存在时，创建远程过程调用客户端
    const client = createRpcClient();
    //以流的形式同步等待获取具体哈希值对应的交易
    const stream = await client.getTx({ hash });
    //若交易data存在，则在命令行中输出有格式的交易信息，若出现问题，则输出对应报错信息。
    stream
      .on('data', result => {
        if (result && result.code === 0 && result.info) {
          shell.echo(`${pretty(result.$format().info.tx)}`);
        } else {
          shell.echo(`${symbols.error} get tx error: ${pretty(result)}`);
        }
      })
      .on('error', err => {
        debug.error(err, err.errno, err.errcode);
        shell.echo(`${symbols.error} transaction not found, maybe a invalid hash?`);
      });
  } catch (err) {
    //若出现错误则抛出异常并提示
    debug.error(err);
    shell.echo(`${symbols.error} transaction not found, check invalid hash?`);
  }
}

exports.run = execute;
exports.execute = execute;
