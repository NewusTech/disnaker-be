'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Application extends Model {
    static associate(models) {
      Application.belongsTo(models.User, { foreignKey: 'user_id' });
      Application.belongsTo(models.Vacancy, { foreignKey: 'vacancy_id' });
    }
  }
  Application.init({
    user_id: DataTypes.INTEGER,
    vacancy_id: DataTypes.INTEGER,
    status: DataTypes.ENUM('Dilamar', 'Wawancara', 'Tes', 'Diterima', 'Ditolak'),
  }, {
    sequelize,
    modelName: 'Application',
  });
  Application.addHook('beforeFind', (options) => {
    if (!options.order) {
      options.order = [['id', 'DESC']];
    }
  });
  return Application;
};