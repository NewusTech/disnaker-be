'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Company extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Company.belongsTo(models.User, {
        foreignKey: 'user_id',
      });
    }
  }
  Company.init({
    user_id: DataTypes.INTEGER,
    department: DataTypes.STRING,
    name: DataTypes.STRING,
    desc: DataTypes.TEXT,
    address: DataTypes.STRING,
    numberEmployee: DataTypes.INTEGER,
    website: DataTypes.STRING,
    instagram: DataTypes.STRING,
    imageLogo: DataTypes.STRING,
    imageBanner: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Company',
  });
  return Company;
};