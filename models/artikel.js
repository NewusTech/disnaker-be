'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Artikel extends Model {
    static associate(models) {
      Artikel.belongsTo(models.Kategoriartikel, {
        foreignKey: 'kategori_id',
      });
    }
  }
  Artikel.init({
    title: DataTypes.STRING,
    slug: DataTypes.STRING,
    desc: DataTypes.TEXT,
    image: DataTypes.STRING,
    kategori_id: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'Artikel',
  });
  Artikel.addHook('beforeFind', (options) => {
    if (!options.order) {
      options.order = [['id', 'DESC']];
    }
  });
  return Artikel;
};