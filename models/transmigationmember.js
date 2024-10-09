'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class TransmigationMember extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      TransmigationMember.belongsTo(models.Transmigation, {
        foreignKey: 'transmigration_id'
      })
    }
  }
  TransmigationMember.init({
    transmigration_id: DataTypes.INTEGER,
    nik: DataTypes.STRING,
    name: DataTypes.STRING,
    gender: DataTypes.ENUM('Laki-laki', 'Perempuan'),
    familyStatus: DataTypes.ENUM('Suami','Istri','Orang Tua','Anak', 'Lainnya'),
  }, {
    sequelize,
    modelName: 'TransmigationMember',
  });
  return TransmigationMember;
};