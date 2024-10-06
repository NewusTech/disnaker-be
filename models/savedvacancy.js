'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class SavedVacancy extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      SavedVacancy.belongsTo(models.User, { foreignKey: 'user_id'});
      SavedVacancy.belongsTo(models.Vacancy, { foreignKey: 'vacancy_id'});
    }
  }
  SavedVacancy.init({
    vacancy_id: DataTypes.INTEGER,
    user_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'SavedVacancy',
  });
  return SavedVacancy;
};