'use-strict';

const request = require('superagent');
const Bluebird = require('bluebird');

module.exports.ping = (options) => {
  if (options.ip) {
    return request.post(`${options.ip}/ewallet/ping`)
    .then(res => {
      return console.log(JSON.parse(res.text));
    })
  }
  return request
    .get('152.118.31.2/list.php')
    .then(result => {
      return Bluebird.each(result, item => {
        if (item.npm === options.user_id) {
          return request.post(`${item.ip}/ewallet/ping`)
            .then(res => {
              return console.log(JSON.parse(res.text));
            })    
        }
      })
    })
}