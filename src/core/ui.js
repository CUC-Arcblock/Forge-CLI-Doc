const ora = require('ora');
const util = require('util');
const chalk = require('chalk');
const inquirer = require('inquirer');
const progress = require('cli-progress');
const symbols = require('log-symbols');
const prettyjson = require('prettyjson');

// https://github.com/sindresorhus/cli-spinners/blob/master/spinners.json
const spinners = [
  'dots',
  'dots2',
  'dots3',
  'dots4',
  'dots5',
  'dots6',
  'dots7',
  'dots8',
  'dots9',
  'dots10',
  'dots11',
  'dots12',
  'line',
  'line2',
  'pipe',
  'simpleDots',
  'simpleDotsScrolling',
  'star',
  'star2',
  'flip',
  'hamburger',
  'growVertical',
  'growHorizontal',
  'balloon',
  'balloon2',
  'noise',
  'bounce',
  'boxBounce',
  'boxBounce2',
  'triangle',
  'arc',
  'circle',
  'squareCorners',
  'circleQuarters',
  'circleHalves',
  'squish',
  'toggle',
  'toggle2',
  'toggle3',
  'toggle4',
  'toggle5',
  'toggle6',
  'toggle7',
  'toggle8',
  'toggle9',
  'toggle10',
  'toggle11',
  'toggle12',
  'toggle13',
  'arrow',
  'arrow2',
  'arrow3',
  'bouncingBar',
  'bouncingBall',
  'smiley',
  'monkey',
  'hearts',
  'clock',
  'earth',
  'moon',
  'runner',
  'pong',
  'shark',
  'dqpb',
  'weather',
  'christmas',
  'grenade',
  'point',
  'layer',
];

const getSpinner = opts => { //随机返回spinner数组里面的一个元素
  const random = Math.floor(Math.random() * spinners.length);
  // 得到 0 - spinners.length-1 之间的整数
  // Math.random()生成0-1之间的浮点型随机数
  // Math.floor(x)对x进行向下取整
  const spinner = ora(Object.assign({ spinner: spinners[random] }, opts || {}));
  /*  ora包用于显示加载中的效果，类似于前端页面的loading效果
  * Object.assign() 方法用于将所有可枚举属性的值从一个或多个源对象分配到目标对象。它将返回目标对象。
  * 应用举例：https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
  */
  if (typeof opts === 'string') {
    spinner.text = opts;
  }

  return spinner;
};

const wrapSpinner = async (message = '', func) => {
  const spinner = getSpinner(message);

  spinner.start();
  // start spinner 
  const result = await func();
  spinner.succeed();
  // Stop the spinner, change it to a green ✔ and persist the text. Returns the instance. See the GIF below.
  return result;
};

module.exports = {
  symbols,
  hr: new inquirer.Separator().line,
  pretty: (data, options) => {
    if (data && typeof data === 'object') {
      return `\n${prettyjson.render(data, options)}\n`;
    }

    return util.inspect(data, Object.assign({ depth: 8, colors: true, compact: false }, options));
  
  },
  getProgress: ({ title, unit = 'MB' }) =>
    new progress.Bar({
      format: `${title} |${chalk.cyan('{bar}')} {percentage}% || {value}/{total} ${unit}`,
      barCompleteChar: '\u2588',
      barIncompleteChar: '\u2591',
      hideCursor: true,
    }),
  getSpinner,
  wrapSpinner,
};
