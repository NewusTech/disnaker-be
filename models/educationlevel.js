'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class EducationLevel extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      EducationLevel.belongsToMany(models.Vacancy,{
        foreignKey:'educationLevel_id',
        through: 'VacancyEducationLevel'
      });
      EducationLevel.hasMany(models.YellowCard, {
        foreignKey: 'educationLevel_id',
      });
    }
  }
  EducationLevel.init({
    level: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'EducationLevel',
  });
  return EducationLevel;
};