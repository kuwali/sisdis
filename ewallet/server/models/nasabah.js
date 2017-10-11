'use strict';

module.exports = (sequelize, DataTypes) => {
  var Nasabah = sequelize.define('Nasabah', {
    user_id: DataTypes.STRING,
    nama: DataTypes.STRING,
    registerReturn: DataTypes.INTEGER,
    nilai_saldo: DataTypes.INTEGER
  }, {});
  return Nasabah;
};
