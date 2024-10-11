'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class VacancyCategory extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      VacancyCategory.hasMany(models.Vacancy, {
        foreignKey: 'category_id',
      })
    }
  }
  VacancyCategory.init({
    name: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'VacancyCategory',
  });
  return VacancyCategory;
};