'use-strict';

const request = require('superagent');
const Bluebird = require('bluebird');

module.exports.transfer = (options) => {
  if (!options.ip) return console.log('Need ip :(');
  if (!options.user_id || !options.nilai) return console.log('Args needed');
  return request
    .post(`${options.ip}/ewallet/transfer`)
    .send({user_id: options.user_id, nilai: options.nilai})
    .then(res => {
      res = JSON.parse(res.text);
      if (res.status_transfer === -1) {
        request
          .get('http://127.0.0.1/ewallet/nasabah')
          .then(result => {
            result = JSON.parse(result.text);
            Bluebird.each(result, item => {
              if (item.npm === options.user_id) {
                request
                  .post(`${options.ip}/ewallet/register`)
                  .send({user_id: item.user_id, nama: item.nama});
              }
            })
          })
      }
      return console.log(res);
    })
}