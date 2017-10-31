'use-strict';

const request = require('superagent');
const Bluebird = require('bluebird');

module.exports.register = (options) => {
  if (!options.ip) return console.log('Need ip :(');
  if (options.me) {
    return request
      .post(`${options.ip}/ewallet/register`)
      .send({user_id: '1406543763', nama: 'Kustiawanto Halim'})
      .then(res => {return console.log(JSON.parse(res.text))})
  }
  if (!options.user_id || !options.name) return console.log('Args needed');
  return request
    .post(`${options.ip}/ewallet/register`)
    .send({user_id: options.user_id, nama: options.name})
    .then(res => {return console.log(JSON.parse(res.text))})
}