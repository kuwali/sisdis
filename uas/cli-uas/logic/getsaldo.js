'use-strict';

const getSaldo = require('../../pubs/get_saldo_publisher');

module.exports.getsaldo = (options) => {
  if (!options.ip || !options.user_id) return console.log('Args needed');
  getSaldo(options.ip, options.user_id);
}