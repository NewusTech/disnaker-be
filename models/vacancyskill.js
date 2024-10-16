'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class VacancySkill extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
    }
  }
  VacancySkill.init({
    vacancy_id: DataTypes.INTEGER,
    skill_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'VacancySkill',
  });
  return VacancySkill;
};