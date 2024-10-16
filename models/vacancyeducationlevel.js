'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class VacancyEducationLevel extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
    }
  }
  VacancyEducationLevel.init({
    vacancy_id: DataTypes.INTEGER,
    educationLevel_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'VacancyEducationLevel',
  });
  return VacancyEducationLevel;
};