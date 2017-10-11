'use strict';

module.exports = {
  notAllowed (req, res) {
    return res
      .status(405)
      .send({status: -99});
  }
};
