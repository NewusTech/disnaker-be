'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class SyaratKetentuan extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  SyaratKetentuan.init({
    desc: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'SyaratKetentuan',
  });
  return SyaratKetentuan;
};