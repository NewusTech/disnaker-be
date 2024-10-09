'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class YellowCard extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  YellowCard.init({
    residance: DataTypes.TEXT,
    submissionNumber:{
      type: DataTypes.STRING,
      unique: true
    },
    provinsi: DataTypes.STRING,
    kabupaten: DataTypes.STRING,
    kecamatan: DataTypes.STRING,
    kelurahan: DataTypes.STRING,
    educationLevel_id: DataTypes.INTEGER,
    job: DataTypes.STRING,
    skill: DataTypes.TEXT,
    status: DataTypes.ENUM('Pengajuan', 'Proses', 'Terbit', 'Ditolak')
  }, {
    sequelize,
    modelName: 'YellowCard',
  });
  return YellowCard;
};