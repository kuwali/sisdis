'use strict';

const _ = require('lodash');
const Bluebird = require('bluebird');
const request = require('superagent').agent();

const list = [
  { 'ip': '172.17.0.19', 'npm': '1406577386' },
  { 'ip': '172.17.0.50', 'npm': '1406543712' },
  { 'ip': '172.17.0.33', 'npm': '1406559111' },
  { 'ip': '172.17.0.17', 'npm': '1406579100' },
  { 'ip': '172.17.0.31', 'npm': '1406565133' }
];

let counter;

module.exports = {
  check () {
    return Bluebird
      .resolve().then(() => {
        counter = 0;
        return _.forEach(list, cabang => {
          return request
            .get(`${cabang.ip}/ewallet/ping`)
            .then(response => {
              if (response.pong === 1) {
                counter++;
              }
            });
        });
      })
      .then(() => {
        return counter;
      });
  },
  length () {
    return list.length();
  }
};
