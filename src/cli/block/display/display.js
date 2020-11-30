const shell = require('shelljs');
const chalk = require('chalk');
//退出
const onExit = require('death');
//lodash内部封装了对字符串、数组、对象等常见数据类型的处理函数
const { range, uniq } = require('lodash');
const { sleep } = require('core/util');
const { createRpcClient } = require('core/env');
const debug = require('core/debug')('display');
const { symbols, hr, pretty } = require('core/ui');

//获取块高度
function parseBlockHeight(input, latest) {
  if (input === 'first') {  //第一块
    return [1];
  }

  if (input === 'last' || input === 'latest') {  //最后一块
    return [latest];
  }

  // range 有个范围，格式为num1...num2
  if (input.indexOf('...') > 0) {
    const [lower, upper] = input.split('...').map(x => Number(x));   //获取上下界
    debug('parseBlockHeight', { input, lower, upper, latest });
    if (lower && upper) {
      return range(lower, upper)  //返回范围
        .concat(upper)
        .filter(x => x > 0 && x <= latest);  //指定有效范围
    }
  }

  // number 具体指定，num1,num2
  const tmp = input.split(',').filter(x => !!x);
  debug('parseBlockHeight', { input, tmp });
  if (!tmp.length) {
    shell.echo(`${symbols.info} query latest block at ${latest}`);
    return [latest];  //返回最新出的块号
  }

  // list 
  return tmp
    .map(x => Number(x))                  //x必须为整数
    .map(x => (x > 0 ? x : latest + x))   //若x为负数，则输出latest+x
    .filter(x => x > 0 && x <= latest);   //指定有效范围
}

//仅显示块的信息
function displayBlock(res, opts) {
  const { block } = res.$format();
  if (block && !opts.showTxs) {
    delete block.txs;
  }
  shell.echo(hr);   //行分隔符
  shell.echo(`Block#${res.block.height} ${pretty(block)}`);
  shell.echo('');
}

//获取具体块并显示信息
async function fetchBlocks(client, heights, opts) {
  try {
    const stream = await client.getBlock(heights.map(x => ({ height: x })));  //获取高度为x的块
    stream
      .on('data', d => displayBlock(d, opts))    //显示块信息
      .on('error', err => {  //显示错误信息
        debug.error(err);
        shell.echo(
          `${symbols.error} block not found, maybe invalid height, run ${chalk.cyan(
            'forge status chain'
          )} to check latest height?`
        );
      });
  } catch (err) {
    debug.error(err);
    shell.echo(
      `${symbols.error} block not found, maybe invalid height, run ${chalk.cyan(
        'forge status chain'
      )} to check latest height?`
    );
  }
}

//获取实时生成的块信息
async function streamingBlocks(client, opts) {
  let topic = '';
  client
    .subscribe({ topic: 'end_block', filter: '' })
    .on('data', async res => {
      debug('streamingBlocks.data', res);
      if (res.topic) {
        shell.echo(`${symbols.success} Subscribe success, topic: ${res.topic}`);
        shell.echo(`${symbols.info} Waiting for new blocks...`);
        // eslint-disable-next-line prefer-destructuring
        topic = res.topic;
        return;
      }

      if (res.endBlock && res.endBlock.height) {
        await sleep(1000);
        client
          .getBlock(res.endBlock)
          .on('data', d => displayBlock(d, opts))
          .on('error', debug.error);
      }
    })
    .on('error', err => {
      debug.error(err);
      shell.echo(`${symbols.error} block streaming error, ${err.message || err.toString()}`);
    });

  onExit(async () => {  //退出显示Unsubscribing...
    if (topic) {
      shell.echo(`${symbols.info} Unsubscribing...`);
      await client.unsubscribe({ topic });
      process.exit();
    }
  });
}

async function execute({ args: [height = ''], opts = {} }) {
  const client = createRpcClient();
  if (opts.stream) {  //若options为-f
    await streamingBlocks(client, opts);
  } else {  //若options为-d或无
    const { info } = await client.getChainInfo({});  //获取链信息
    const heights = uniq(parseBlockHeight(height, info.blockHeight));  //获取块高度
    debug('Query Blocks on height', heights);

    await fetchBlocks(client, heights, opts);  //获取具体块并显示信息
  }
}

exports.run = execute;
exports.execute = execute;
