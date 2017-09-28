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
      fs.writeFileSync(path.join(__dirname, '../error.log'), `${req.headers.host} [${new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')}] - Error: ${responseModel}`);
      return res.status(400).json(responseModel);
    }
    fs.writeFileSync(path.join(__dirname, '../response.log'), `${req.headers.host} [${new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')}] - Success send spesifikasi.yaml`);
    return res.send(file);
  });
};
