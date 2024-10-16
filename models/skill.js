'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Skill extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Skill.hasMany(models.VacancySkill, {
        foreignKey: 'skill_id',
      });
      Skill.belongsToMany(models.User, {
        through: 'UserSkill',
        foreignKey: 'skill_id'
      });
      Skill.belongsToMany(models.Vacancy, {
        foreignKey: 'skill_id',
        through: 'VacancySkill'
      })
    }
  }
  Skill.init({
    name: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Skill',
  });
  return Skill;
};