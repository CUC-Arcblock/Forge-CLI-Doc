const shell = require('shelljs');
//从地址字符串获取类型信息
const { toTypeInfo } = require('@arcblock/did');
//将大数格式化为可读的数字
const { fromUnitToToken } = require('@arcblock/forge-util');
//createRpcClient创建GRpc客户端;config指的是全局共享的forge-cli运行时配置
const { createRpcClient, config } = require('core/env');
//symbols使终端内容带颜色;hr是行分隔符；pretty调整数据输出格式和颜色，使其更加美观
const { symbols, hr, pretty } = require('core/ui');

async function execute({ args: [addr] }) {
  try {
    const client = createRpcClient();   //创建GRpc客户端
    const address = addr === 'me' ? config.get('cli.wallet').address : addr;
    const typeInfo = toTypeInfo(address, true);   //根据地址获取类型信息并输出
    shell.echo(`Account Type: ${pretty(typeInfo)}`);
    shell.echo(hr);

    const stream = await client.getAccountState({ address });   ////根据地址获取账户状态信息
    stream
      .on('data', result => {
        if (result && result.code === 0) {    //状态码，只有0是OK状态
          const { state } = result.$format();
          if (state) {//若账户有状态
            state.balance = `${fromUnitToToken(state.balance)} TOKEN`;  //将余额balance转成TOKEN
            shell.echo(`Account State: ${pretty(state)}`);
          } else {  //账户无状态
            shell.echo(   //输出错误信息
              `${
                symbols.error
              } cannot get state for address \`${address}\`, please ensure it's valid`
            );
          }
        } else {
          shell.echo(`${symbols.error} get account info error: ${pretty(result)}`);
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
