'use strict';

const Bluebird = require('bluebird');
const Nasabah = require('../models/nasabah');
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
          console.log(`Counter: ${counter} | Quorum Length: ${quorum.length()} | Quorum: ${counter > (quorum.length() / 2)}`);
          var nasabah = Nasabah({
            user_id: req.body.user_id,
            nama: req.body.nama,
            nilai_saldo: 0
          });

          return nasabah.save((err, data) => {
            if (err) {
              console.log(`Error: ${err}, counter: ${counter}`);
              return res
                .send({status_register: -4});
            }

            console.log(`Success: {status_register: 1}, counter: ${counter}`);
            return res
              .send({status_register: 1});
          });
        } else {
          console.log(`Error: -2, counter: ${counter}`);
          return res
            .send({status_register: -2});
        }
      })
      .catch(err => {
        console.log(`Error: ${err}`);
        return res
          .send({status_register: -99});
      });
  },

  list (req, res) {
    return Nasabah
      .find((err, data) => {
        if (err) {
          console.log(`Error: ${err}`);
          return res
            .send({});
        }

        console.log(`Success: ${data}`);
        return res
          .send(data);
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
            .findOne({ 'user_id': req.body.user_id }, (err, nasabah) => {
              if (err) {
                console.log(`Error: -4, counter: ${counter}${err}`);
                return res
                  .send({nilai_saldo: -4});
              }

              if (!nasabah) {
                console.log(`Error: -1, counter: ${counter}`);
                return res
                  .send({nilai_saldo: -1});
              }

              console.log(`Success: {nilai_saldo: ${nasabah.nilai_saldo}}, counter: ${counter}`);
              return res
                .send({nilai_saldo: nasabah.nilai_saldo});
            });
        } else {
          console.log(`Error: -2, counter: ${counter}`);
          return res
            .send({nilai_saldo: -2});
        }
      })
      .catch(err => {
        console.log(`Error: ${err}`);
        return res
          .send({nilai_saldo: -99});
      });
  },

  transfer (req, res) {
    return Bluebird
      .resolve().then(() => {
        if (Number(req.body.nilai) < 0 || Number(req.body.nilai) > 1000000) {
          console.log(`Error: -5`);
          return res
            .send({status_transfer: -5});
        }

        return quorum.check();
      })
      .then(counter => {
        if (counter > quorum.length() / 2) {
          return Nasabah
            .findOne(
              {user_id: req.body.user_id}
            )
            .then(nasabah => {
              if (!nasabah) {
                console.log(`Error: -1, counter: ${counter}`);
                return res
                  .send({status_transfer: -1});
              }

              return Nasabah
                .findOneAndUpdate({ user_id: req.body.user_id },
                  { nilai_saldo: nasabah.nilai_saldo + Number(req.body.nilai) },
                  (err, data) => {
                    if (err) {
                      console.log(`Error: -4, counter: ${counter}${err}`);
                      return res
                        .send({status_transfer: -4});
                    }

                    console.log(`Success: {transfer: 1}, counter: ${counter}`);
                    return res
                      .send({status_transfer: 1});
                  }
                );
            });
        } else {
          console.log(`Error: -2, counter: ${counter}`);
          return res
            .send({status_transfer: -2});
        }
      })
      .catch(err => {
        console.log(`Error: ${err}`);
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
            let error = false;
            return Bluebird.each(list, cabang => {
              return request
                .post(`${cabang.ip}/ewallet/getSaldo`)
                .send({ user_id: req.body.user_id })
                .then(response => {
                  console.log(`Response: ${response.nilai_saldo}`);
                  if (response.nilai_saldo) {
                    saldoTotal += response.nilai_saldo;
                  } else {
                    error = true;
                  }
                });
            })
              .then(() => {
                if (error) {
                  console.log(`Error: -3`);
                  return res
                    .send({nilai_saldo: -3});
                }

                console.log(`Success: ${saldoTotal}`);
                return res
                  .send({nilai_saldo: saldoTotal});
              })
              .catch(err => {
                console.log(`Error: -3, counter: ${counter}${err}`);
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
                    console.log(`Success: {getTotalSaldo: 1}`);
                    return res
                      .send(JSON.parse(result.text));
                  });
              }
            })
              .catch(err => {
                console.log(`Error: -3, counter: ${counter}${err}`);
                return res
                  .send({nilai_saldo: -3});
              });
          }
        } else {
          console.log(`Error: -2, counter: ${counter}`);
          return res
            .send({nilai_saldo: -2});
        }
      })
      .catch(err => {
        console.log(`Error: ${err}`);
        return res
          .send({nilai_saldo: -99});
      });
  },

  updateSaldo (req, res) {
    return Bluebird.resolve().then(() => {
      return Nasabah
        .findOne(
          {user_id: '1406543763'}
        )
        .then(nasabah => {
          return Nasabah
            .findOneAndUpdate(
              { user_id: '1406543763' },
              { nilai_saldo: nasabah.nilai_saldo - Number(req.body.potongan) },
              (err, data) => {
                if (err) {
                  console.log(`Error: -4, counter: ${err}`);
                  return res
                    .send({status_transfer: -4});
                }

                if (!nasabah) {
                  console.log(`Error: -1`);
                  return res
                    .send({status_transfer: -1});
                }

                console.log(`Success: {update_saldo: 1}`);
                return res
                  .send({status_transfer: 1});
              }
            );
        });
    });
  }

};
