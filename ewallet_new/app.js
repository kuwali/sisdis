'use strict';

const express = require('express');
const logger = require('morgan');
var mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
app.set('json spaces', 2);

app.use(logger('dev'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// connecting to database
app.db = mongoose.connect(process.env.MONGOLAB_URI || 'mongodb://heroku_7fkg54g6:14pe8ufq8qncppqghsfjsd6qu7@ds237815.mlab.com:37815/heroku_7fkg54g6', { useMongoClient: true });
mongoose.Promise = global.Promise;
console.log("connected to database");

require('./server/routes')(app);

module.exports = app;