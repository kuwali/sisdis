'use strict';

module.exports = {
  notAllowed (req, res) {
    console.log(`Error: Not allowed`);
    return res
      .status(405)
      .send({status: -99});
  }
};
