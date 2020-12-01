const { createRpcClient } = require('core/env');
const { toBase64 } = require('@arcblock/forge-util');
const { pretty } = require('core/ui');
const { print } = require('core/util');

async function main() {
  //创建远程过程调用客户端
  const client = createRpcClient();
  //同步等待获得所有的交易
  const res = await client.listTransactions();
  //并在交易列表中将所有信息如pk和signature等数据进行base64编码
  const transactions = res.transactionsList.map(transaction => {
    transaction.tx.pk = toBase64(transaction.tx.pk);
    transaction.tx.signature = toBase64(transaction.tx.signature);
    transaction.tx.signaturesList.forEach(signature => {
      signature.signature = toBase64(signature.signature);
    });

    return transaction;
  });
  //在完成后返回并输出展示所有的交易信息。
  print(pretty(transactions));
}

exports.run = main;
exports.execute = main;
