'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Event extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Event.belongsTo(models.VacancyCategory, {
        foreignKey: 'category_id',
      });
    }
  }
  Event.init({
    title: DataTypes.STRING,
    slug: {
      type: DataTypes.STRING,
      unique: true
    },
    desc: DataTypes.TEXT,
    category_id: DataTypes.INTEGER,
    image: DataTypes.STRING,
    startDate: DataTypes.DATEONLY,
    endDate: DataTypes.DATEONLY,
    regisLink: DataTypes.STRING,
    phoneNumber: DataTypes.STRING,
    time: DataTypes.STRING,
    location: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Event',
  });
  
  Event.addHook('beforeFind', (options) => {
    if (!options.order) {
      options.order = [['id', 'DESC']];
    }
  });
  return Event;
};