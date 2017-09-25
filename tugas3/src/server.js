'use strict';

require('dotenv').config();

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
  app.get('/', (req, res) => {
    res.send('Hello, World!');
  });

  app.listen(process.env.PORT, () => {
    console.log(`Server is listening on port: ${process.env.PORT}`);
  })
}