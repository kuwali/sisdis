'use strict';

const Bluebird = require('bluebird');
const fs = Bluebird.promisifyAll(require('fs'));
const path = require('path');

module.exports = {
  notAllowed (req, res) {
    fs.appendFileSync(path.join(__dirname, '../../error.log'), `${req.headers.host} [${new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')}] - Error: -2\n`);
    return res
      .status(405)
      .send({status: -99});
  }
};
