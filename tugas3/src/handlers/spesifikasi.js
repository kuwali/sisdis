'use strict';

const fs = require('fs');
const path = require('path');

module.exports = (req, res) => {
  return fs.readFile(path.join(__dirname, '../spesifikasi.yaml'), (err, file) => {
    if (err) {
      const responseModel = {
        detail: `File spesifikasi.yaml error: ${err}`,
        status: 400,
        title: 'Bad Request'
      };
      fs.appendFileSync(path.join(__dirname, '../error.log'), `${req.headers['x-forwarded-for'] || req.connection.remoteAddress} [${new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')}] - Error: ${responseModel}\n`);
      return res.status(400).json(responseModel);
    }
    fs.appendFileSync(path.join(__dirname, '../response.log'), `${req.headers['x-forwarded-for'] || req.connection.remoteAddress} [${new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')}] - Success send spesifikasi.yaml\n`);
    return res.send(file);
  });
};
