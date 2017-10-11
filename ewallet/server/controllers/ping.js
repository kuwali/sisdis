'use strict';

module.exports = {
  ping (req, res) {
    return res
      .status(200)
      .send({pong: 1});
  }
};
