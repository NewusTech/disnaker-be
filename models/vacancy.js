'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Vacancy extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Vacancy.belongsTo(models.Company, {
        foreignKey: 'company_id',
      });
      Vacancy.belongsTo(models.VacancyCategory, {
        foreignKey: 'category_id',
      });
    }
  }
  Vacancy.init({
    category_id: DataTypes.INTEGER,
    company_id: DataTypes.INTEGER,
    title: DataTypes.STRING,
    desc: DataTypes.TEXT,
    responsibility: DataTypes.TEXT,
    requirement: DataTypes.TEXT,
    gender: DataTypes.ENUM('Laki-laki', 'Perempuan'),
    minExperience: DataTypes.INTEGER,
    maxAge: DataTypes.INTEGER,
    workingDay: DataTypes.STRING,
    workingHour: DataTypes.STRING,
    jobType: DataTypes.ENUM('Full Time', 'Part Time', 'Freelance'),
    workLocation: DataTypes.ENUM('Onsite', 'Remote', 'Hybrid'),
    isPublished: DataTypes.ENUM('true', 'false'),
    applicationDeadline: DataTypes.DATEONLY,
    salary: DataTypes.DECIMAL
  }, {
    sequelize,
    modelName: 'Vacancy',
  });
  return Vacancy;
};