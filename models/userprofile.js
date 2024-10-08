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
    user_id: {
      type: DataTypes.INTEGER,
      unique: true,
    },
    name: DataTypes.STRING,
    nik: {
      type: DataTypes.STRING,
      unique: true,
    },
    birthDate: DataTypes.DATEONLY,
    slug: DataTypes.STRING,
    department: DataTypes.STRING,
    gender: DataTypes.ENUM('Laki-laki', 'Perempuan'),
    address: DataTypes.TEXT,
    phoneNumber: DataTypes.STRING,
    about: DataTypes.TEXT,
    cv: DataTypes.STRING,
    portfolio: DataTypes.STRING,
    birthPlace: DataTypes.STRING,
    religion: DataTypes.STRING,
    location: DataTypes.STRING,
    profession: DataTypes.STRING,
    image: DataTypes.STRING,
    employmentStatus: DataTypes.ENUM('Sudah Bekerja', 'Siap Bekerja', 'Tidak Bekerja'),
    maritalStatus: DataTypes.ENUM('Menikah', 'Belum Menikah'),
    citizenship: DataTypes.ENUM('WNI', 'WNA'),
    deletedAt: DataTypes.DATE
  }, {
    sequelize,
    paranoid: true,
    modelName: 'UserProfile',
  });
  return UserProfile;
};