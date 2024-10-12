'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Certification extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Certification.belongsTo(models.Company, { foreignKey: 'company_id' })
      Certification.belongsTo(models.VacancyCategory, { foreignKey: 'category_id' })
    }
  }
  Certification.init({
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
    level: DataTypes.ENUM('Rendah', 'Menengah', 'Tinggi'),
    regisLink: DataTypes.STRING,
    image: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Certification',
  });
  return Certification;
};