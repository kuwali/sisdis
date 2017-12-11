'use strict';
/**
 * Redis Module Wraper
 *
 * @module
 * @author Kustiawanto Halim <khalim@cermati.com>
 */

const _ = require('lodash');
const redis = require('redis');
const Bluebird = require('bluebird');
Bluebird.promisifyAll(redis.RedisClient.prototype);
Bluebird.promisifyAll(redis.Multi.prototype);

var client;

/**
 * Return redis client, if not initialize, this method will create
 * new redist client instance for you :D
 *
 * @return {RedisClient} client
 */
exports.getClient = () => {
  if (!_.isUndefined(client)) {
    return client;
  }

  client = redis.createClient(process.env.REDIS_PORT, process.env.REDIS_HOST);
  client.on('error', (err) => {
    console.log('Redis client error %s', err.stack || err);
  });

  return client;
};

