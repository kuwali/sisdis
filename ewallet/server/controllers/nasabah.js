'use strict';

const Bluebird = require('bluebird');
const fs = Bluebird.promisifyAll(require('fs'));
const Nasabah = require('../models').Nasabah;
const path = require('path');
const quorum = require('./quorum');
const request = require('superagent').agent();

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
            .findOne(
              { where: { user_id: req.body.user_id } }
            )
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
  },

  transfer (req, res) {
    return Bluebird
      .resolve().then(() => {
        if (Number(req.body.nilai) < 0 || Number(req.body.nilai) > 1000000) {
          fs.appendFileSync(path.join(__dirname, '../../error.log'), `${req.headers.host} [${new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')}] - Error: -5, counter: ${counter}\n`);
          return res
            .send({status_transfer: -5});
        }

        return quorum.check();
      })
      .then(counter => {
        if (counter > quorum.length() / 2) {
          return Nasabah
            .update(
              { nilai_saldo: req.body.nilai_saldo },
              { where: { user_id: req.body.user_id } }
            )
            .then(nasabah => {
              if (!nasabah) {
                fs.appendFileSync(path.join(__dirname, '../../error.log'), `${req.headers.host} [${new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')}] - Error: -1, counter: ${counter}\n`);
                return res
                  .send({status_transfer: -1});
              }

              fs.appendFileSync(path.join(__dirname, '../../response.log'), `${req.headers.host} [${new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')}] - Success: {transfer: 1}, counter: ${counter}\n`);
              return res
                .send({status_transfer: 1});
            })
            .catch(err => {
              fs.appendFileSync(path.join(__dirname, '../../error.log'), `${req.headers.host} [${new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')}] - Error: -4, counter: ${counter}\n${err}\n`);
              return res
                .send({status_transfer: -4});
            });
        } else {
          fs.appendFileSync(path.join(__dirname, '../../error.log'), `${req.headers.host} [${new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')}] - Error: -2, counter: ${counter}\n`);
          return res
            .send({status_transfer: -2});
        }
      })
      .catch(err => {
        fs.appendFileSync(path.join(__dirname, '../../error.log'), `${req.headers.host} [${new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')}] - Error: ${err}\n`);
        return res
          .send({status_transfer: -99});
      });
  },

  getTotalSaldo (req, res) {
    return Bluebird
      .resolve().then(() => {
        return quorum.check();
      })
      .then(counter => {
        if (counter === quorum.length()) {
          let list = quorum.list();
          if (req.body.user_id === '1406543763') {
            let saldoTotal = 0;
            return Bluebird.each(list, cabang => {
              return request
                .post(`${cabang.ip}/ewallet/getSaldo`)
                .send({ user_id: req.body.user_id })
                .then(response => {
                  if (response.body.nilai_saldo) {
                    saldoTotal += response.body.nilai_saldo;
                  } else {
                    fs.appendFileSync(path.join(__dirname, '../../error.log'), `${req.headers.host} [${new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')}] - Error: -4, counter: ${counter}\n${err}\n`);
                    return res
                      .send({nilai_saldo: -3});
                  }
                });
            })
              .then(() => {
                return res
                  .send({nilai_saldo: saldoTotal});
              })
              .catch(err => {
                fs.appendFileSync(path.join(__dirname, '../../error.log'), `${req.headers.host} [${new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')}] - Error: -4, counter: ${counter}\n${err}\n`);
                return res
                  .send({nilai_saldo: -3});
              });
          } else {
            return Bluebird.each(list, cabang => {
              if (cabang.npm === req.body.user_id) {
                return request
                  .post(`${cabang.ip}/ewallet/getTotalSaldo`)
                  .send({ user_id: req.body.user_id })
                  .then(result => {
                    fs.appendFileSync(path.join(__dirname, '../../response.log'), `${req.headers.host} [${new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')}] - Success: {transfer: 1}, counter: ${counter}\n`);
                    return res
                      .send(result);
                  });
              }
            })
              .catch(err => {
                fs.appendFileSync(path.join(__dirname, '../../error.log'), `${req.headers.host} [${new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')}] - Error: -4, counter: ${counter}\n${err}\n`);
                return res
                  .send({nilai_saldo: -3});
              });
          }
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
