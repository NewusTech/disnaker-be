'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserExperience extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      UserExperience.belongsTo(models.User, {
        foreignKey: 'user_id',
      });
    }
  }
  UserExperience.init({
    user_id: DataTypes.INTEGER,
    title: DataTypes.STRING,
    possition: DataTypes.STRING,
    companyName: DataTypes.STRING,
    contractType: DataTypes.STRING,
    joinDate: DataTypes.DATEONLY,
    leaveDate: DataTypes.DATEONLY,
    isCurrently: DataTypes.ENUM('true', 'false'),
    desc: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'UserExperience',
  });
  return UserExperience;
};