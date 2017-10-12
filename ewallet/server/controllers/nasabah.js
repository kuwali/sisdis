'use strict';

const Bluebird = require('bluebird');
const fs = Bluebird.promisifyAll(require('fs'));
const Nasabah = require('../models').Nasabah;
const path = require('path');
const quorum = require('./quorum');

module.exports = {
  create (req, res) {
    return Bluebird
      .resolve().then(() => {
        return quorum.check();
      })
      .then(counter => {
        if (counter > (quorum.length() / 2)) {
          return Nasabah
            .create({
              user_id: req.body.user_id,
              nama: req.body.nama
            })
            .then(() => {
              fs.appendFileSync(path.join(__dirname, '../../response.log'), `${req.headers.host} [${new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')}] - Success: {status_register: 1}, counter: ${counter}\n`);
              return res
                .send({status_register: 1});
            })
            .catch(err => {
              fs.appendFileSync(path.join(__dirname, '../../error.log'), `${req.headers.host} [${new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')}] - Error: ${err}, counter: ${counter}\n`);
              return res
                .send({status_register: -4});
            });
        } else {
          fs.appendFileSync(path.join(__dirname, '../../error.log'), `${req.headers.host} [${new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')}] - Error: -2, counter: ${counter}\n`);
          return res
            .send({status_register: -2});
        }
      })
      .catch(err => {
        fs.appendFileSync(path.join(__dirname, '../../error.log'), `${req.headers.host} [${new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')}] - Error: ${err}\n`);
        return res
          .send({status_register: -99});
      });
  },

  list (req, res) {
    return Nasabah
      .all()
      .then(nasabah => {
        fs.appendFileSync(path.join(__dirname, '../../response.log'), `${req.headers.host} [${new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')}] - Success: ${nasabah}\n`);
        return res
          .send(nasabah);
      })
      .catch(err => {
        fs.appendFileSync(path.join(__dirname, '../../error.log'), `${req.headers.host} [${new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')}] - Error: ${err}\n`);
        return res
          .send({});
      });
  },

  getSaldo (req, res) {
    return Bluebird
      .resolve().then(() => {
        return quorum.check();
      })
      .then(counter => {
        if (counter > quorum.length() / 2) {
          return Nasabah
            .findOne({
              where: {
                user_id: req.body.user_id
              }
            })
            .then(nasabah => {
              if (!nasabah) {
                fs.appendFileSync(path.join(__dirname, '../../error.log'), `${req.headers.host} [${new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')}] - Error: -1, counter: ${counter}\n`);
                return res
                  .send({nilai_saldo: -1});
              }

              fs.appendFileSync(path.join(__dirname, '../../response.log'), `${req.headers.host} [${new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')}] - Success: {nilai_saldo: ${nasabah.nilai_saldo}}, counter: ${counter}\n`);
              return res
                .send({nilai_saldo: nasabah.nilai_saldo});
            })
            .catch(err => {
              fs.appendFileSync(path.join(__dirname, '../../error.log'), `${req.headers.host} [${new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')}] - Error: -4, counter: ${counter}\n${err}\n`);
              return res
                .send({nilai_saldo: -4});
            });
        } else {
          fs.appendFileSync(path.join(__dirname, '../../error.log'), `${req.headers.host} [${new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')}] - Error: -2, counter: ${counter}\n`);
          return res
            .send({nilai_saldo: -2});
        }
      })
      .catch(err => {
        fs.appendFileSync(path.join(__dirname, '../../error.log'), `${req.headers.host} [${new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')}] - Error: ${err}\n`);
        return res
          .send({nilai_saldo: -99});
      });
  }
};
