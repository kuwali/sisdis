'use strict';

const error = require('./error');
const nasabah = require('./nasabah');
const ping = require('./ping');
const quorum = require('./quorum');

module.exports = {
  error,
  nasabah,
  ping,
  quorum
};
