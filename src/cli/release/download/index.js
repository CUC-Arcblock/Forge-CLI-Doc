const shell = require('shelljs');
/*  引入shelljs，shelljs是linux下脚本语言解析器
 * 用法举例：
 * const sh = require('shelljs')
 * sh.exec(`npm run scp2-test-dist ${process.argv[2]}`)
*/
const chalk = require('chalk');   //chalk是一个颜色插件
const { cli, action } = require('core/cli'); 
/**
 * 引入本地的core/cli
 * 其中的cli(){}函数将命令push到allCommands中，完成命令注册工作
 * 其中的action(){execute,run,input}执行execute(input)或者run(input)
 */
const { 
  
 } = require('core/libs/common'); 
const { execute, run } = require('./download'); 

const minSupportVersion = getMinSupportForgeVersion(); //所支持的最小的forge版本

cli(
  'download [version]',
  'Download a forge release without activate it',
  input => action(execute, run, input), //箭头函数
  {
    requirements: { //需求
      forgeRelease: false, //
      runningNode: false, 
      rpcClient: false,  //远程调用客户端
      wallet: false,
      chainName: false,   //链名
      chainExists: false, //链是否存在 
    },
    options: [['-f, --force', 'Clean local downloaded assets before download']],
    handlers: {
      '--help': () => {
        shell.echo(`
Examples:
  - ${chalk.cyan('forge download')}           download latest version
  - ${chalk.cyan(`forge download ${minSupportVersion}`)}    download forge v${minSupportVersion}
  - ${chalk.cyan(`forge download v${minSupportVersion}`)}   download forge v${minSupportVersion}
  - ${chalk.cyan('forge download --mirror https://releases.arcblockio.cn')}      specify a mirror
        `);
        // chalk.cyan 前景色关键字
      },
    },
  }
);