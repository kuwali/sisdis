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
exports.save = state => {
  return store
    .setAsync(state.npm, JSON.stringify(state))
    .then(() => {
      // Set expire time to 10 secs.
      // After expire, key will be removed.
      return store.expire(state.npm, 10);
    });
};

/**
 * Fetch state based on key.
 * Key must be socket.io id.
 *
 * @param {String} key - socket.io id
 * @return {JSON|null} - State JSON Representation
 */
exports.fetch = key => {
  return store
   .getAsync(key)
   .then(JSON.parse);
};

/**
 * Remove state based on key.
 * Key must be socket.io id.
 *
 * @param {String} key - socket.io id
 * @return {Number} - 1 if success, otherwise 0
 */
exports.remove = key => {
  return store
    .delAsync(key);
};

exports.count = () => {
  return store
    .getAsync("*")
    .then(JSON.parse);
}