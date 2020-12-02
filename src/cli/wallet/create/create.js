const shell = require('shelljs');
const inquirer = require('inquirer');
const base64 = require('base64-url');
const { types } = require('@arcblock/mcrypto');
const { fromRandom, WalletType } = require('@arcblock/forge-wallet');
const { toBase58, hexToBytes } = require('@arcblock/forge-util');
const { pretty } = require('core/ui');

// types定义了枚举了公私钥的算法、哈希算法、DID钱包角色、地址编码算法。
const questions = [
  {
    type: 'list',
    name: 'role',
    default: types.RoleType.ROLE_ACCOUNT,
    message: 'Please select a role type:',
    choices: Object.keys(types.RoleType),
    //Object.keys(arr): 返回=>一个表示给定对象的所有可枚举属性的字符串数组。
  },
  {
    type: 'list',
    name: 'pk',
    default: types.KeyType.ED25519,
    message: 'Please select a key pair algorithm:',
    choices: Object.keys(types.KeyType),
  },
  {
    type: 'list',
    name: 'hash',
    default: types.HashType.SHA3,
    message: 'Please select a hash algorithm:',
    choices: Object.keys(types.HashType),
  },
];

async function main({ opts: { defaults } }) {
  let wallet = fromRandom(); // 生成一个钱包，无法进行签名、验证等
  let encoding = ['BASE16', 'BASE58', 'BASE64', 'BASE64_URL'];

  if (!defaults) {
    const { pk, hash, role } = await inquirer.prompt(questions);
    // 让用户根据questions选择信息。
    const type = WalletType({
    // WalletType是创建一个生成钱包的类型对象，该对象用于创建一个钱包
      pk: types.KeyType[pk],
      hash: types.HashType[hash],
      role: types.RoleType[role],
      address: types.EncodingType.BASE58,
    });

    wallet = fromRandom(type); // 重新按照type生成钱包

     // 让用户选择一种编码方式
    const result = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'encoding',
        default: ['BASE16', 'BASE58', 'BASE64', 'BASE64_URL'],
        message: 'Please select public/secret key encoding format:',
        choices: ['BASE16', 'BASE58', 'BASE64', 'BASE64_URL', 'BINARY'],
      },
    ]);

    // eslint-disable-next-line prefer-destructuring
    encoding = result.encoding;
  }

  const json = wallet.toJSON();// 将钱包对象序列化
  if (!encoding.length) {
    // encoding没有选择上的话，默认以BASE16编码公私钥
    encoding = ['BASE16'];
  }

  if (encoding.includes('BASE16')) {
    json.pk_base16 = json.pk;
    json.sk_base16 = json.sk;
  }
  if (encoding.includes('BASE58')) {
    json.pk_base58 = toBase58(json.pk);
    json.sk_base58 = toBase58(json.sk);
  }
  if (encoding.includes('BASE64')) {
    json.pk_base64 = Buffer.from(hexToBytes(json.pk)).toString('base64');
    json.sk_base64 = Buffer.from(hexToBytes(json.sk)).toString('base64');
    /**
     * hexToBytes : 十六进制转Bytes
     *
     * Buffer : js内置的缓冲区类
     * Buffer.from(string[, encoding]) ：创建一个包含 string 的新 Buffer。 
     * encoding 参数指定用于将 string 转换为字节的字符编码。
     * encoding默认为utf-8。
     * 
     * buf.toString([encoding[, start[, end]]])
     * 根据 encoding 指定的字符编码将 buf 解码成字符串。 传入 start 和 end 可以只解码 buf 的子集。
     *  */ 
    
  }
  if (encoding.includes('BASE64_URL')) {
    json.pk_base64_url = base64.encode(hexToBytes(json.pk));
    json.sk_base64_url = base64.encode(hexToBytes(json.sk));
  }
  if (encoding.includes('BINARY')) {
    json.pk_binary = hexToBytes(json.pk).join(',');
    json.sk_binary = hexToBytes(json.sk).join(',');
  }

  delete json.pk;
  delete json.sk;

  shell.echo(pretty(json));
}

exports.run = main;
exports.execute = main;
