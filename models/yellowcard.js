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
    kelurahan_id: DataTypes.INTEGER,
    kecamatan_id: DataTypes.INTEGER,
    educationLevel_id: DataTypes.INTEGER,
    job: DataTypes.STRING,
    status: DataTypes.ENUM('Pengajuan', 'Proses', 'Terbit', 'Ditolak')
  }, {
    sequelize,
    modelName: 'YellowCard',
  });
  return YellowCard;
};