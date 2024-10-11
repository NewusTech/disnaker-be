'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserOrganization extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      UserOrganization.belongsTo(models.User, {
        foreignKey: 'user_id',
      });
    }
  }
  UserOrganization.init({
    user_id: DataTypes.INTEGER,
    name: DataTypes.STRING,
    organizationName: DataTypes.STRING,
    joinDate: DataTypes.DATEONLY,
    leaveDate: DataTypes.DATEONLY,
    desc: DataTypes.TEXT,
    isCurrently: DataTypes.ENUM('true', 'false'),
  }, {
    sequelize,
    modelName: 'UserOrganization',
  });
  UserOrganization.addHook('beforeFind', (options) => {
    if (!options.order) {
      options.order = [['id', 'DESC']];
    }
  });
  return UserOrganization;
};