'use-strict';

const getTotalSaldo = require('../../pubs/get_total_saldo_publisher');

module.exports.gettotalsaldo = (options) => {
  if (!options.ip || !options.user_id) return console.log('Args needed');
  getTotalSaldo(options.ip, options.user_id);
}