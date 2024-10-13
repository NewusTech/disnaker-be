'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Role extends Model {
    static associate(models) {
      Role.hasMany(models.User, {
        foreignKey: 'role_id',
      });
      Role.belongsToMany(models.Permission, {
        foreignKey: 'role_id',
        through: 'RoleHasPermissions', 
      })
    }
  }
  Role.init({
    name: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'Role',
  });
  return Role;
};