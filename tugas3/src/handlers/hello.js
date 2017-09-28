'use strict';

const Bluebird = require('bluebird');
const fs = Bluebird.promisifyAll(require('fs'));
const path = require('path');
const request = require('superagent').agent();
const url = '172.17.0.70:17088';

module.exports = (req, res) => {
  if (req.headers['content-type'] !== 'application/json') {
    fs.writeFileSync(path.join(__dirname, '../error.log'), `${req.headers.host} [${new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')}] - Error: not json`);
    const responseModel = {
      detail: 'Only consume JSON type',
      status: 405,
      title: 'Method Not Allowed'
    };
    res.status(405).json(responseModel);
  } else {
    const data = req.body.request;
    if (!data) {
      fs.writeFileSync(path.join(__dirname, '../error.log'), `${req.headers.host} [${new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')}] - Error: request property not set`);
      const responseModel = {
        detail: "'request' is a required property",
        status: 400,
        title: 'Bad Request'
      };
      res.status(400).json(responseModel);
    } else {
      return Bluebird.resolve()
        .then(() => {
          return request.get(url);
          // Debugging local purpose
          // return {
          //   'datetime': '2017-09-26T11:51:37.499118Z',
          //   'state': 'Morning'
          // };
        })
        .then(event => {
          event = JSON.parse(event);
          return fs.readFileAsync(path.join(__dirname, '../counter'))
            .then(counter => {
              fs.writeFileSync(path.join(__dirname, '../counter'), `${++counter}`);
              const responseModel = {
                apiversion: 2,
                count: counter,
                currentvisit: new Date().toISOString(),
                response: `Good ${event.state}, ${data}`
              };
              fs.writeFileSync(path.join(__dirname, '../response.log'), `${req.headers.host} [${new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')}] - Success with: ${responseModel}`);
              return res.json(responseModel);
            });
        })
        .catch(err => {
          fs.writeFileSync(path.join(__dirname, '../error.log'), `[${new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')}] - Error: ${err}`);
          const responseModel = {
            detail: `Error: ${err}`,
            status: 400,
            title: 'Bad Request'
          };
          return res.status(400).json(responseModel);
        });
    }
  }
};
