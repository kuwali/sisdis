'use-strict';

const request = require('superagent');
const Bluebird = require('bluebird');

module.exports.getsaldo = (options) => {
  if (!options.ip) return console.log('Need ip :(');
  if (!options.user_id) return console.log('Args needed');
  return request
    .post(`${options.ip}/ewallet/getSaldo`)
    .send({user_id: options.user_id})
    .then(res => {
      res = JSON.parse(res.text);
      if (res.nilai_saldo === -1) {
        request
          .get('http://127.0.0.1/ewallet/nasabah')
          .then(result => {
            result = JSON.parse(result.text);
            Bluebird.each(result, item => {
              if (item.user_id === options.user_id) {
                request
                  .post(`${options.ip}/ewallet/register`)
                  .send({user_id: item.user_id, nama: item.nama})
                  .then(() => {console.log('registered')});
              }
            })
          })
      }
      return console.log(res);
    })
}