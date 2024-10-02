'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserPermission extends Model {
    static associate(models) {
    }
  }
  UserPermission.init({
    user_id: DataTypes.INTEGER,
    permission_id: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'UserPermission',
  });
  return UserPermission;
};