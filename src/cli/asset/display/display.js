const shell = require('shelljs');
const { createRpcClient } = require('core/env');
//symbols使终端内容带颜色;pretty调整数据输出格式和颜色，使其更加美观
const { symbols, pretty } = require('core/ui');

async function execute({ args: [address] }) {
  try {
    const client = createRpcClient();     //创建GRpc客户端
    const stream = await client.getAssetState({ address });   //根据地址获取资产状态
    stream
      .on('data', result => {
        if (result && result.code === 0) {
          const { state } = result.$format();
          if (state) {    //若有资产状态
            shell.echo(`${pretty(state)}`);
          } else {        //若无资产状态
            shell.echo(   //报错
              `${
                symbols.error
              } cannot get state for address \`${address}\`, please ensure it's valid`
            );
          }
        } else {
          shell.echo(`${symbols.error} get asset info error: ${pretty(result)}`);
        }
      })
      .on('error', err => {
        shell.echo(`${symbols.error} error: ${err}`);
      });
  } catch (err) {
    shell.echo(`${symbols.error} error: ${err}`);
  }
}

exports.run = execute;
exports.execute = execute;
