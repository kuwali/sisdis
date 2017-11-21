'use strict';

module.exports = {
  ping (req, res) {
    return res
      .send({pong: 1});
  }
};
