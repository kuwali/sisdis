'use-strict';

const request = require('superagent');
const Bluebird = require('bluebird');

module.exports.getsaldo = (options) => {
  if (!options.ip) return console.log('Need ip :(');
  if (!options.user_id) return console.log('Args needed');
  return request
    .post(`${options.ip}/ewallet/getTotalSaldo`)
    .send({user_id: options.user_id})
    .then(res => {
      res = JSON.parse(res.text);
      if (res.nilai_saldo === -1) {
        request
          .get('127.0.0.1/ewallet/nasabah')
          .then(result => {
            Bluebird.each(result, item => {
              if (item.npm === options.user_id) {
                request
                  .post(`${item.ip}/ewallet/register`)
                  .send({user_id: item.user_id, name: item.name});
              }
            })
          })
      }
      return console.log(res);
    })
}