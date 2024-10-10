'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserLink extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      UserLink.belongsTo(models.User, {
        foreignKey: 'user_id',
      });
    }
  }
  UserLink.init({
    user_id: DataTypes.INTEGER,
    link: DataTypes.STRING,
    linkType: DataTypes.ENUM('portfolio', 'instagram', 'facebook', 'twitter', 'linkedin'),
  }, {
    sequelize,
    modelName: 'UserLink',
  });
  UserLink.addHook('beforeFind', (options) => {
    if (!options.order) {
      options.order = [['id', 'DESC']];
    }
  });
  return UserLink;
};