'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserEducationHistory extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
    }
  }
  UserEducationHistory.init({
    user_id: DataTypes.INTEGER,
    educationLevel_id: DataTypes.INTEGER,
    instanceName: DataTypes.STRING,
    department: DataTypes.STRING,
    gpa: DataTypes.DECIMAL,
    joinDate: DataTypes.DATEONLY,
    graduationDate: DataTypes.DATEONLY,
    desc: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'UserEducationHistory',
  });
  return UserEducationHistory;
};