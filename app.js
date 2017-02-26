var argv = require('minimist')(process.argv.slice(2));
var fs = require('fs');
var inquirer = require('inquirer');
var tto = require('terminal-table-output').create();
var clear = require('clear');

// Load the full build.
var _ = require('lodash');
// Load the FP build for immutable auto-curried iteratee-first data-last methods.
var fp = require('lodash/fp');
// Load method categories.
var array = require('lodash/array');
var object = require('lodash/fp/object');
// Cherry-pick methods for smaller browserify/rollup/webpack bundles.
var at = require('lodash/at');
var curryN = require('lodash/fp/curryN');

var result;
var rand;
var file = argv._[0];
var chosen;
var logData;
var ifWin;
var resObjs = [];

var LogData = function(you, comp, res) {
  this.you = you;
  this.comp = comp;
  this.res = res;
};

var questions1 = [
  {
    type: 'list',
    name: 'choice',
    message: 'heads or tails',
    choices: ['heads', 'tails'],
  },
];
var questions2 = [
  {
    type: 'confirm',
    name: 'showStat',
    message: 'Show statistics?',
    default: 'y',
  }
];
var questions3 = [
  {
    type: 'confirm',
    name: 'showStat',
    message: 'New game?',
    default: 'y',
  }
];
function newGame() {
  clear();
  inquirer.prompt(questions1).then(function(answers) {
    if (Math.random() < 0.5) {
      rand = 'heads';
    } else {
      rand = 'tails';
    }

    if (answers.choice === rand) {
      console.log('Nastya, you win, you chosen', answers.choice, 'and it was', rand);
      ifWin = 'win';
    } else {
      console.log('Nastya, you loose, you chosen', answers.choice, 'but it was', rand);
      ifWin = 'loose';
    }
    console.log('-------------------------------------');

    logData = new LogData(answers.choice, rand, ifWin);

    fs.appendFile(
      file || 'results.txt',
      JSON.stringify(logData) + ' ',
      'utf8', function(err) {
        if (err) {
          console.error(err);
          process.exit(1);
        }
      });
    inquirer.prompt(questions2).then(function(answers) {
      if (answers.showStat) {
        showStatistics();
      }
      inquirer.prompt(questions3).then(function(answers) {
        if (answers.showStat) {
          console.log('');
          newGame();
        }
      });
    });

  });
}

function showStatistics() {
  clear();
  try {
    result = fs.readFileSync(file || 'results.txt', 'utf8').toString();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
  resObjs = result.split(' ').filter(function(item) {
    if (item != '') {
      return item;
    } else {
      return undefined;
    }
  });
  var statYouHeads = 0;
  var statYouTails = 0;
  var statCompHeads = 0;
  var statCompTails = 0;
  var statResWin = 0;
  var statResLoose = 0;
  var obj;
  resObjs.forEach(function(item) {
    obj = JSON.parse(item);
    if (obj.you === 'heads') {
      statYouHeads++;
    } else {
      statYouTails++;
    }

    if (obj.comp === 'heads') {
      statCompHeads++;
    } else {
      statCompTails++;
    }

    if (obj.res === 'win') {
      statResWin++;
    } else {
      statResLoose++;
    }
  });

  tto.pushrow([' ', 'Heads', 'Tails', 'Wins'])
    .line()
    .pushrow(['You', statYouHeads, statYouTails, statResWin])
    .pushrow(['Comp', statCompHeads, statCompTails, statResLoose])
    .line()
    .pushrow(['Total games:', '', '', resObjs.length])
    .print(true);

}

newGame();
