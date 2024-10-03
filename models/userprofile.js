'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserProfile extends Model {
    static associate(models) {
      UserProfile.belongsTo(models.User, {
        foreignKey: 'user_id',
      });
    }
  }
  UserProfile.init({
    name: DataTypes.STRING,
    nik: {
      type: DataTypes.STRING,
      unique: true,
    },
    slug: DataTypes.STRING,
    email: {
      type: DataTypes.STRING,
      unique: true,
    },
    phoneNumber: DataTypes.STRING,
    alamat: DataTypes.STRING,
    agama: DataTypes.INTEGER,
    tempat_lahir: DataTypes.STRING,
    tgl_lahir: DataTypes.DATEONLY,
    status_kawin: DataTypes.SMALLINT,
    gender: DataTypes.SMALLINT,
    pekerjaan: DataTypes.STRING,
    goldar: DataTypes.SMALLINT,
    pendidikan: DataTypes.SMALLINT,
    foto: DataTypes.STRING,
    deletedAt: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'UserProfile',
  });
  return UserProfile;
};