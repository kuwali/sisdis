'use strict';

const Bluebird = require('bluebird');
const fs = Bluebird.promisifyAll(require('fs'));
const path = require('path');
const request = require('superagent').agent();

const list = [
  { 'ip': '172.17.0.45', 'npm': 'Ina' },
  { 'ip': '172.17.0.15', 'npm': 'Ai' },
  { 'ip': '172.17.0.48', 'npm': 'ko1' },
  { 'ip': '172.17.0.47', 'npm': 'Irma' },
  { 'ip': '172.17.0.58', 'npm': 'Gentur' }
];

module.exports = {
  check () {
    return Bluebird.resolve().then(() => {
      let counter = 0;
      return Bluebird.each(list, cabang => {
        return request
          .post(`${cabang.ip}/ewallet/ping`)
          .then(response => {
            if (response.body.pong === 1) {
              counter += 1;
            }
          })
          .catch(err => {
            fs.appendFileSync(path.join(__dirname, '../../error.log'), `-- [${new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')}] - Error: ${err}\n`);
          });
      })
        .then(() => {
          fs.appendFileSync(path.join(__dirname, '../../response.log'), `-- [${new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')}] - Success: ${counter}\n`);
          return counter;
        });
    })
      .catch(err => {
        fs.appendFileSync(path.join(__dirname, '../../error.log'), `-- [${new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')}] - Error: ${err}\n`);
        return 0;
      });
  },
  length () {
    return list.length;
  },
  list () {
    return request
      .get('152.118.31.2/list.php')
      .then(result => {
        return result;
      })
      .catch(err => {
        fs.appendFileSync(path.join(__dirname, '../../error.log'), `-- [${new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')}] - Error: ${err}\n`);
        return [];
      });
  }
};
