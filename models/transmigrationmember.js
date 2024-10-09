'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class TransmigrationMember extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      TransmigrationMember.belongsTo(models.Transmigration, {
        foreignKey: 'transmigration_id'
      })
    }
  }
  TransmigrationMember.init({
    transmigration_id: DataTypes.INTEGER,
    nik: DataTypes.STRING,
    name: DataTypes.STRING,
    gender: DataTypes.STRING,
    familyStatus: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'TransmigrationMember',
  });
  return TransmigrationMember;
};