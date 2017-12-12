'use strict';
/**
 * This is singleton for store abstaction.
 * For now, we use redis as store management.
 *
 * @module
 * @author Kustiawanto Halim <khalim@cermati.com>
 */
const store = require('../utils/redis').getClient();

/**
 * Save current state.
 * State represent in JSON format.
 *
 * @param {JSON} state - State JSON Representation
 * @return {String|Error} - "OK" if saved, or error.
 */
exports.save = saldo => {
  return store
    .setAsync('total_saldo', saldo);
};

/**
 * Fetch state based on 'total_saldo'.
 * 'total_saldo' must be socket.io id.
 *
 * @param {String} 'total_saldo' - socket.io id
 * @return {JSON|null} - State JSON Representation
 */
exports.fetch = () => {
  return store
   .getAsync('total_saldo')
   .then(JSON.parse);
};

/**
 * Remove state based on 'total_saldo'.
 * 'total_saldo' must be socket.io id.
 *
 * @param {String} 'total_saldo' - socket.io id
 * @return {Number} - 1 if success, otherwise 0
 */
exports.remove = () => {
  return store
    .setAsync('total_saldo', '0');
};


exports.update = (tambahan) => {
  return store
   .getAsync('total_saldo')
   .then(saldo => {
     return store
      .setAsync('total_saldo', Number(saldo) + Number(tambahan));
   });
};