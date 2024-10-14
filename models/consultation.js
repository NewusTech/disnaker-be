'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Consultation extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Consultation.belongsTo(models.Company, { foreignKey: 'company_id' });
      Consultation.belongsTo(models.VacancyCategory, { foreignKey: 'category_id' });
    }
  }
  Consultation.init({
    company_id: DataTypes.INTEGER,
    category_id: DataTypes.INTEGER,
    title: DataTypes.STRING,
    desc: DataTypes.TEXT,
    location: DataTypes.STRING,
    quota: DataTypes.INTEGER,
    startDate: DataTypes.DATEONLY,
    endDate: DataTypes.DATEONLY,
    time: DataTypes.STRING,
    phoneNumber: DataTypes.STRING,
    regisLink: DataTypes.STRING,
    image: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Consultation',
  });
  return Consultation;
};