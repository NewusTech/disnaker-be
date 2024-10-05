'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class JobInvitation extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  JobInvitation.init({
    user_id: DataTypes.INTEGER,
    company_id: DataTypes.INTEGER,
    vacancy_id: DataTypes.INTEGER,
    status: DataTypes.ENUM("Pending", "Diterima", "Ditolak"),
    invitationDate: DataTypes.DATE,
    responseDate: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'JobInvitation',
  });
  return JobInvitation;
};