'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Permission extends Model {
    static associate(models) {
      Permission.belongsToMany(models.User, {
        through: 'UserPermissions',
        as: 'users',
        foreignKey: 'permission_id'
      });
      Permission.belongsToMany(models.Role, {
        foreignKey: 'permission_id',
        through: 'RoleHasPermissions'
      });
    }
  }
  Permission.init({
    name: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'Permission',
  });
  return Permission;
};