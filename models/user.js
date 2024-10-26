'use strict';
const {
  Model
} = require('sequelize');
const { default: slugify } = require('slugify');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.belongsTo(models.Role, {
        foreignKey: 'role_id',
      });

      User.hasOne(models.Jabatan, {
        foreignKey: 'user_id',
      });

      User.hasOne(models.Company, {
        foreignKey: 'user_id',
      });

      User.hasMany(models.SurveyKepuasan, {
        foreignKey: 'user_id',
      });
      User.hasMany(models.Complaint, {
        foreignKey: 'user_id',
      }); 
      User.hasMany(models.YellowCard, {
        foreignKey: 'user_id',
      });
      User.hasMany(models.UserExperience, {
        foreignKey: 'user_id',
      });
      User.hasMany(models.UserEducationHistory, {
        foreignKey: 'user_id',
      });
      User.hasMany(models.UserOrganization, {
        foreignKey: 'user_id',
      });
      User.hasMany(models.UserSkill, {
        foreignKey: 'user_id',
      });
      User.hasMany(models.UserCertificate, {
        foreignKey: 'user_id'
      });
      User.hasMany(models.UserLink, {
        foreignKey: 'user_id'
      });
      User.hasOne(models.UserProfile, {
        foreignKey: 'user_id',
      });
      User.hasMany(models.UserLink, {
        foreignKey: 'user_id'
      });
      User.hasMany(models.Application, { foreignKey: 'user_id' });
      User.hasMany(models.Transmigration, { foreignKey: 'user_id' });
      User.hasMany(models.SavedVacancy, { foreignKey: 'user_id' });
      User.belongsToMany(models.Permission, {
        through: 'UserPermissions',
        as: 'permissions',
        foreignKey: 'user_id'
      });
      User.belongsToMany(models.Skill, {
        through: 'UserSkill',
        foreignKey: 'user_id'
      });

      User.hasMany(models.JobInvitation, {
        foreignKey: 'user_id'
      });

    }
  }
  User.init({
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    slug: DataTypes.STRING,
    isActive: DataTypes.ENUM('true', 'false'),
    role_id: DataTypes.INTEGER,
    deletedAt: DataTypes.DATE,
    resetpasswordtoken: DataTypes.STRING,
    resetpasswordexpires: DataTypes.DATE,
  }, {
    sequelize,
    modelName: 'User',
    defaultScope: {
      attributes: { exclude: ['password'] }
    },
    scopes: {
      withPassword: { attributes: {} },
    }
  });

  function generateUniqueSlug() {
    const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });

    return uuid;
  }

  User.addHook('beforeCreate', async (user) => {
    user.slug = generateUniqueSlug();
    user.isActive = 'true';
  });
  return User;
};