'use strict';

const Bluebird = require('bluebird');
const fs = Bluebird.promisifyAll(require('fs'));
const path = require('path');
const request = require('superagent').agent();

const list = [
  { 'ip': '172.17.0.45', 'npm': '1406543795' },
  { 'ip': '172.17.0.48', 'npm': '1406543763' },
  { 'ip': '172.17.0.22', 'npm': '1406574296'},
  { 'ip': '172.17.0.53', 'npm': '1406543643' },
  { 'ip': '172.17.0.9', 'npm': '1306412086'},
  { 'ip': '172.17.0.25', 'npm': '1406572006'}
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
  },
  ip (req, res) {
    return Bluebird.resolve().then(() => {
      return res.send(list);
    });
  }
};
