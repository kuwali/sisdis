'use strict';

const fs = (require('fs'));
const path = require('path');

module.exports = (req, res) => {
  const data = req.params.counter;
  const responseModel = {
    apiversion: 2,
    plusoneret: Number(data) + 1
  };
  fs.writeFileSync(path.join(__dirname, '../response.log'), `${req.headers.host} [${new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')}] - Success with: ${responseModel}`);
  return res.json(responseModel);
};
