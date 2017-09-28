'use strict';

const fs = (require('fs'));
const path = require('path');

module.exports = (req, res) => {
  const responseModel = {
    detail: 'The requested URL was not found on the server.  If you entered the URL manually please check your spelling and try again.',
    status: 404,
    title: 'Not Found'
  };
  fs.writeFileSync(path.join(__dirname, '../error.log'), `${req.headers.host} [${new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')}] - Error: 404`);
  return res.status(404).send(responseModel);
};
