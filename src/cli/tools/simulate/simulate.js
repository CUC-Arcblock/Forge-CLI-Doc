const shell = require('shelljs');
const chalk = require('chalk');
const { symbols } = require('core/ui');
const { runNativeSimulatorCommand } = require('core/env');
const { getSimulatorProcess } = require('core/forge-process');
//获取core/env中的makeNativeCommandRunner(daemon)函数所返回的执行命令的结果为模拟器
//具体命令为command = `${erlAflagsParam} FORGE_SOCK_GRPC=${sockGrpc} ${binPath} ${subCommand}`; 
const startSimulator = runNativeSimulatorCommand('daemon');

async function main({ args: [action = 'start'] }) {
  const { pid } = await getSimulatorProcess();//首先尝试获取一个假设已经运行的simulator进程的PID值，若成功获取，则说明此时正有simulator在运行。
  //若命令为start
  if (action === 'start') {
    //若pid存在即有simulator进程正在运行
    if (pid) {
      //提醒并关闭此次命令执行
      shell.echo(`${symbols.error} simulator is already started!`);
      process.exit(0);
    } else {
      //若此时没有simulator正在运行则开启之
      startSimulator();
      shell.echo(`${symbols.success} Simulator started`);
    }
  }

  //若命令为Stop
  if (action === 'stop') {
    //若pid存在即有simulator进程正在运行
    if (pid) {
      //杀死正在运行的simulator进程
      shell.exec(`kill ${pid}`);
      shell.echo(`${symbols.success} Simulator stopped`);
    } else {
      //若此时无正在运行的simulator进程，则提醒并关闭此次命令执行
      shell.echo(`${symbols.error} simulator is not started yet!`);
      shell.echo(`${symbols.info} Please run ${chalk.cyan('forge simulate start')} first!`);
      process.exit(0);
    }
  }

  process.exit();
}

exports.run = main;
exports.execute = main;
