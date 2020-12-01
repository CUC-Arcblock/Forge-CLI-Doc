const fuzzy = require('fuzzy');
const chalk = require('chalk');
const inquirer = require('inquirer');
const shell = require('shelljs');
const safeEval = require('safe-eval');
const { enums } = require('@arcblock/forge-proto');
const { fakeMessage } = require('@arcblock/forge-message');
const { symbols, hr, pretty } = require('core/ui');
const { createRpcClient, config } = require('core/env');
const debug = require('core/debug')('tx:send');
//inquirer中注册对话，类型为autocomplete
inquirer.registerPrompt('autocomplete', require('inquirer-autocomplete-prompt'));
//构造假消息
const fakeMessages = enums.SupportedTxs.reduce((acc, x) => {
  acc[x] = pretty(fakeMessage(x), { colors: false });
  return acc;
}, {});
//构造向inquirer中提出的问题
const questions = [
  //问题1：要发送的交易类型是什么
  {
    type: 'autocomplete',
    name: 'type',
    message: 'Select transaction type you want to send:',
    source: (_, input) =>
      Promise.resolve(
        fuzzy
          .filter(input || '', enums.SupportedTxs)
          .map(x => x.original)
          .sort()
      ),
  },
  //问题2：请放置要发送的交易object
  {
    type: 'editor',
    name: 'itx',
    message: 'Please enter the itx data object (js supported):',
    //默认使用假消息
    default: answers => fakeMessages[answers.type],
    //若交易是证实的，则尝试建立rpc客户端
    validate: x => {
      try {
        safeEval(x, { client: createRpcClient() });
      } catch (err) {
        return err.message || err.toString();
      }

      return true;
    },
  },
];

async function main(data) {
  const client = createRpcClient();
  const { type, itx: itxStr } = data;
  const itx = safeEval(itxStr, { client });
  const wallet = config.get('cli.wallet');

  shell.echo(hr);
  shell.echo(pretty(itx));
  shell.echo(hr);

  try {
    //根据具体的交易类型，调用rpc客户机的不同的send函数，参数为钱包的token和交易信息，完成交易的发送
    const method = `send${type}`;
    //由rpc客户
    const res = await client[method]({
      token: wallet.token,
      tx: {
        from: wallet.address,
        itx,
      },
    });

    debug(`send ${type} tx`, res);
    shell.echo(`${symbols.success} tx send success! ${chalk.cyan(res)}`);
  } catch (err) {
    debug.error(err);
    shell.echo(`${symbols.error} tx send failed: {errcode: ${err.errcode}, errno: ${err.errno}}`);
  }
}

function run() {
  //有命令参数时，此函数首先执行，并在inquirer处理完问题后，由promise链式调用主函数，并将参数带入main中
  inquirer.prompt(questions).then(main);
}

exports.run = run;
exports.execute = main;
