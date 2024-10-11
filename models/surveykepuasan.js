'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class SurveyKepuasan extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      SurveyKepuasan.belongsTo(models.User, {
        foreignKey: 'user_id'
      });
    }
  }
  SurveyKepuasan.init({
    user_id: DataTypes.INTEGER,
    isEasyUse: DataTypes.STRING,
    serviceTransparency: DataTypes.TEXT,
    appExperience: DataTypes.TEXT,
    feedback: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'SurveyKepuasan',
  });
  return SurveyKepuasan;
};