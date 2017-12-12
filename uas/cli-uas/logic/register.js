'use-strict';

const register = require('../../pubs/register_publisher');

module.exports.register = (options) => {
  if (!options.ip) return console.log('Need destination :(');
  if (!options.user_id || !options.name) return console.log('Args needed');
  return register(options.ip, options.user_id, options.name);
}