'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Jabatan extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Jabatan.belongsTo(models.User, {
        foreignKey: 'user_id'
      });
    }
  }
  Jabatan.init({
    user_id: DataTypes.INTEGER,
    name: DataTypes.STRING,
    nip: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Jabatan',
  });
  return Jabatan;
};