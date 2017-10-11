'use strict';

const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');

const app = express();
app.set('json spaces', 2);

app.use(logger('dev'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

require('./server/routes')(app);

module.exports = app;
