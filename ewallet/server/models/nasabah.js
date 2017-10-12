'use strict';

module.exports = (sequelize, DataTypes) => {
  var Nasabah = sequelize.define('Nasabah', {
    user_id: DataTypes.STRING,
    nama: DataTypes.STRING,
    nilai_saldo: DataTypes.INTEGER
  }, {});
  return Nasabah;
};
