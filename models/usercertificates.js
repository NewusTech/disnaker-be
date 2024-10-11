'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserCertificate extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      UserCertificate.belongsTo(models.User, {
        foreignKey: 'user_id',
      });
    }
  }
  UserCertificate.init({
    user_id: DataTypes.INTEGER,
    name: DataTypes.STRING,
    organization: DataTypes.STRING,
    file: DataTypes.STRING,
    expiredDate: DataTypes.DATEONLY,
    isNonExpire: DataTypes.ENUM('true', 'false'),
    desc: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'UserCertificate',
  });
  UserCertificate.addHook('beforeFind', (options) => {
    if (!options.order) {
      options.order = [['id', 'DESC']];
    }
  });
  return UserCertificate;
};