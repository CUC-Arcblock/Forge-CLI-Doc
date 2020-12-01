const fuzzy = require('fuzzy');
const inquirer = require('inquirer');
const shell = require('shelljs');
const safeEval = require('safe-eval');
const { enums } = require('@arcblock/forge-proto');
const { fakeMessage } = require('@arcblock/forge-message');
const { symbols, hr, pretty } = require('core/ui');
const { createRpcClient, config } = require('core/env');
const debug = require('core/debug')('tx:sign');
//inquirer中注册对话，类型为autocomplete
inquirer.registerPrompt('autocomplete', require('inquirer-autocomplete-prompt'));
//构造假消息
const fakeMessages = enums.SupportedTxs.reduce((acc, x) => {
  acc[x] = pretty(fakeMessage(x), { colors: false });
  return acc;
}, {});
//构造向inquirer中提出的问题
const questions = [
  //问题1：要签名的交易类型是什么
  {
    type: 'autocomplete',
    name: 'type',
    message: 'Select transaction type you want to sign:',
    source: (_, input) =>
      Promise.resolve(
        fuzzy
          .filter(input || '', enums.SupportedTxs)
          .map(x => x.original)
          .sort()
      ),
  },
  {
    //问题2：要签名的交易是那一个，请放入文件
    type: 'editor',
    name: 'itx',
    message: 'Please enter the inner transaction:',
    //默认使用假消息
    default: answers => fakeMessages[answers.type],
    //若交易是合法的，则尝试建立rpc客户端
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

function main(data) {
  const client = createRpcClient();
  const { type, itx: itxStr } = data;
  const itx = safeEval(itxStr, { client });
  const wallet = config.get('cli.wallet');

  shell.echo(hr);
  shell.echo(pretty(itx));
  shell.echo(hr);

  //查看账户的状态，尝试收集钱包的地址，token，状态中的nonce等信息，并进行具体交易类型的创建与签名。
  return new Promise(resolve => {
    //通过rpc客户端获取账户的状态
    const account = client.getAccountState({ address: wallet.address });
    //通过交易的data来创建交易，收集信息
    account.on('data', async ({ state }) => {
      try {
        const res = await client.createTx({
          from: wallet.address,
          token: wallet.token,
          nonce: state.nonce,
          itx: { type, value: itx },
        });
        //进行签名
        debug(`sign ${type} tx`, res);
        shell.echo(`${symbols.success} tx create success!`);
        shell.echo(res.$format().tx);
      } catch (err) {
        debug.error(err);
        shell.echo(`${symbols.error} tx create failed`);
      }

      resolve();
    });
  });
}

function run() {
  //有命令参数时，此函数首先执行，并在inquirer处理完问题后，由promise链式调用主函数，并将参数带入main中
  inquirer.prompt(questions).then(main);
}

exports.run = run;
exports.execute = main;
