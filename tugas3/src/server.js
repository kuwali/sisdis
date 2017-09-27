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
  app.use(bodyParser.json());

  app.post('/api/hello', require('./handlers/hello'));
  app.get('/api/spesifikasi.yaml', require('./handlers/spesifikasi'));

  app.get('/*', require('./handlers/404'));
  app.post('/*', require('./handlers/404'));

  app.listen(process.env.PORT, () => {
    console.log(`Server is listening on port: ${process.env.PORT}`);
  })
}