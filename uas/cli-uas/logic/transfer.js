'use-strict';

const transfer = require('../../pubs/transfer_publisher');

module.exports.transfer = (options) => {
  if (!options.ip || !options.user_id || !options.nilai) return console.log('Args needed');
  transfer(options.ip, options.user_id, options.nilai)
}