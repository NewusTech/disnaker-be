'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Complaint extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Complaint.init({
    user_id: DataTypes.INTEGER,
    submissionNumber:{
      type: DataTypes.STRING,
      unique: true
    },
    title: DataTypes.STRING,
    desc: DataTypes.TEXT,
    response: DataTypes.TEXT,
    file: DataTypes.STRING,
    status: DataTypes.ENUM('Proses','Diterima','Ditutup')
  }, {
    sequelize,
    modelName: 'Complaint',
  });
  return Complaint;
};