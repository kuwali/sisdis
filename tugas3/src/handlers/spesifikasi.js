'use strict';

const fs = require('fs');
const path = require('path');

module.exports = (req, res) => {
  return fs.readFile(path.join(__dirname, '../spesifikasi.yaml'), (err, file) => {
    if (err) {
      const responseModel = {
        detail: `File spesifikasi.yaml error: ${err}`,
        status: 400,
        title: "Bad Request"
      }
      return res.status(400).json(responseModel);
    }
    return res.send(file);
  })
}
