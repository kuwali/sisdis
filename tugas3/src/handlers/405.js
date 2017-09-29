'use strict';

const fs = (require('fs'));
const path = require('path');

module.exports = (req, res) => {
  const responseModel = {
    detail: 'Only consume JSON type',
    status: 405,
    title: 'Method Not Allowed'
  };
  fs.appendFileSync(path.join(__dirname, '../error.log'), `${req.headers['x-forwarded-for'] || req.connection.remoteAddress} [${new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')}] - Error: 405\n`);
  return res.status(405).send(responseModel);
};
