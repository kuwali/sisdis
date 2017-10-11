'use strict';

const Bluebird = require('bluebird');
const fs = Bluebird.promisifyAll(require('fs'));
const path = require('path');

module.exports = {
  ping (req, res) {
    fs.appendFileSync(path.join(__dirname, '../../response.log'), `${req.headers.host} [${new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')}] - Success: {pong: 1}\n`);
    return res
      .send({pong: 1});
  }
};
