'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Transmigration extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Transmigration.init({
    domicile: DataTypes.TEXT,
    kecamatan_id: DataTypes.INTEGER,
    kelurahan_id: DataTypes.INTEGER,
    provinsi_id: DataTypes.INTEGER,
    kabupaten_id: DataTypes.INTEGER,
    status:DataTypes.ENUM('Pengajuan', 'Proses', 'Terbit', 'Diterima', 'Ditolak'),
    kk: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Transmigration',
  });
  return Transmigration;
};