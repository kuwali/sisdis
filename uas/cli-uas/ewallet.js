'use-strict'

const program = require('commander');
const register = require('./logic/register').register;
const getsaldo = require('./logic/getsaldo').getsaldo;
const transfer = require('./logic/transfer').transfer;
const gettotalsaldo = require('./logic/gettotalsaldo').gettotalsaldo;

program
  .version('0.0.1')
  .description('CLI for ewallet sisdis program');

program
  .command('register')
  .alias('r')
  .description('Register to specific ip')
  .option('-i, --ip <ip>', '')
  .option('-u, --user_id <user_id>', '')
  .option('-n, --name <name>', '')
  .action(register);

program
  .command('getsaldo')
  .alias('s')
  .description('Get saldo from ip')
  .option('-i, --ip <ip>', '')
  .option('-u, --user_id <user_id>', '')
  .action(getsaldo);

program
  .command('transfer')
  .alias('t')
  .description('Transfer some money to specific ip')
  .option('-i, --ip <ip>', '')
  .option('-u, --user_id <user_id>', '')
  .option('-n, --nilai <nilai>', '')
  .action(transfer)

program
  .command('gettotalsaldo')
  .alias('tot')
  .description('Get total saldo from specific user_id')
  .option('-i, --ip <ip>', '')
  .option('-u, --user_id <user_id>', '')
  .action(gettotalsaldo);

program.parse(process.argv);