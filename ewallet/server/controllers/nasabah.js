'use strict';

const Bluebird = require('bluebird');
const Nasabah = require('../models').Nasabah;
const quorum = require('./quorum');

module.exports = {
  create (req, res) {
    return Bluebird
      .resolve().then(() => {
        let counter = quorum.check();
        if (counter >= (quorum.length() / 2)) {
          return Nasabah
            .create({
              user_id: req.body.user_id,
              nama: req.body.nama,
              registerReturn: req.body.registerReturn
            })
            .then(() => {
              return res
                .send({status_register: 1});
            })
            .catch(() => {
              return res
                .send({status_register: -4});
            });
        } else {
          return res
            .send({status_register: -2});
        }
      })
      .catch(err => {
        console.log(err);
      });
  },

  list (req, res) {
    return Nasabah
      .all()
      .then(nasabah => {
        return res
          .send(nasabah);
      })
      .catch((err) => {
        return res
          .send(err);
      });
  },

  getSaldo (req, res) {
    return Bluebird
      .resolve().then(() => {
        let counter = quorum.check();
        if (counter >= quorum.length() / 2) {
          return Nasabah
            .findOne({
              where: {
                user_id: req.body.user_id
              }
            })
            .then(nasabah => {
              if (!nasabah) {
                res
                  .send({nilai_saldo: -4});
              }

              res
                .send({nilai_saldo: nasabah.nilai_saldo});
            })
            .catch(() => {
              res
                .send({nilai_saldo: -4});
            });
        } else {
          res
            .send({nilai_saldo: -2});
        }
      })
      .catch(err => {
        console.log(err);
      });
  }
};
