'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserCertificates extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      UserCertificates.belongsTo(models.User, {
        foreignKey: 'user_id',
      });
    }
  }
  UserCertificates.init({
    user_id: DataTypes.INTEGER,
    name: DataTypes.STRING,
    organization: DataTypes.STRING,
    expiredDate: DataTypes.DATEONLY,
    isNonExpire: DataTypes.ENUM('true', 'false'),
    desc: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'UserCertificates',
  });
  return UserCertificates;
};