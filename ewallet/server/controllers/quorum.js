'use strict';

const Bluebird = require('bluebird');
const request = require('superagent').agent();

const list = [
  { 'ip': '172.17.0.45', 'npm': 'Ina' },
  { 'ip': '172.17.0.15', 'npm': 'Ai' },
  { 'ip': '172.17.0.48', 'npm': 'ko1' },
  { 'ip': '172.17.0.47', 'npm': 'Irma' }
];

let counter;

module.exports = {
  check () {
    return Bluebird.resolve().then(() => {
      counter = 0;
      return Bluebird.each(list, cabang => {
        if (cabang.npm !== 'ko1') {
          return request
            .get(`${cabang.ip}/ewallet/ping`)
            .then(response => {
              if (response.pong === 1) {
                counter++;
              }
            });
        }
        return;
      })
        .then(() => {
          return counter;
        });
    })
      .catch((err) => {
        console.log(err);
        return 0;
      });
  },
  length () {
    return list.length;
  }
};
