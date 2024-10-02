'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Kategoriartikel extends Model {
    static associate(models) {
      Kategoriartikel.hasMany(models.Artikel, {
        foreignKey: 'kategori_id',
      });
    }
  }
  Kategoriartikel.init({
    title: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'Kategoriartikel',
  });
  return Kategoriartikel;
};