'use strict';

const Bluebird = require('bluebird');
const request = require('superagent').agent();
const url = '172.17.0.70:17088';

module.exports = (req, res) => {
  const data = req.body.request;
  if (!data) {
    const responseModel = {
      detail: "'request' is a required property",
      status: 400,
      title: "Bad Request"
    }
    res.status(400).json(responseModel);
  } else {
    return Bluebird.resolve()
      .then(() => {
        return request.get(url);
        // return {
        //   "datetime": "2017-09-26T11:51:37.499118Z",
        //   "state": "Morning"
        // };
      })
      .then(event => {
        const responseModel = {
          apiversion: 1,
          count: 0,
          currentvisit: new Date().toISOString(),
          response: `Good ${event.state}, ${data}`
        }
        return res.json(responseModel);
      })
      .catch(err => {
        console.log(err);
        const responseModel = {
          detail: `Failed to get time, error: ${err}`,
          status: 400,
          title: "Bad Request"
        }
        return res.status(400).json(responseModel);
      })
  }
}