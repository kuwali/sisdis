'use strict';

const errorController = require('../controllers').error;
const checkQuorum = require('../controllers').quorum;
const nasabahController = require('../controllers').nasabah;
const pingController = require('../controllers').ping;

module.exports = (app) => {
  app.post('/ewallet/ping', pingController.ping);
  app.get('/ewallet/nasabah', nasabahController.list);

  // app.use(checkQuorum.check);

  app.post('/ewallet/register', nasabahController.create);
  app.post('/ewallet/getSaldo', nasabahController.getSaldo);

  app.all('/ewallet/register', errorController.notAllowed);
  app.all('/ewallet/getSaldo', errorController.notAllowed);
  app.all('/ewallet/ping', errorController.notAllowed);
  app.all('/ewallet/nasabah', errorController.notAllowed);

  app.all('/*', (req, res) => res.status(404).send({
    status: -99
  }));
};
