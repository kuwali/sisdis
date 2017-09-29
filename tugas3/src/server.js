'use strict';

require('dotenv').config();

const bodyParser = require('body-parser');
const cluster = require('cluster');
const express = require('express');
const app = express();

if (cluster.isMaster) {
  // Count the machine's CPUs
  const cpuCount = require('os').cpus().length;
  // Create a worker for each CPU
  for (var i = 0; i < cpuCount; i += 1) {
    cluster.fork();
  }
} else {
  app.set('json spaces', 2);
  app.use(bodyParser.json());

  app.post('/api/hello', require('./handlers/hello'));
  app.all('/api/hello', require('./handlers/405'));
  app.get('/api/plus_one/:counter(\\d+)', require('./handlers/plusone'));
  app.all('/api/plus_one/:counter(\\d+)', require('./handlers/405'));
  app.get('/api/spesifikasi.yaml', require('./handlers/spesifikasi'));
  app.all('/api/spesifikasi.yaml', require('./handlers/405'));

  app.all('/*', require('./handlers/404'));

  app.listen(process.env.PORT, () => {
    console.log(`Server is listening on port: ${process.env.PORT}`);
  });
}
