'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('UserEducationHistories', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER
      },
      educationLevel_id: {
        type: Sequelize.INTEGER
      },
      instanceName: {
        type: Sequelize.STRING
      },
      department: {
        type: Sequelize.STRING
      },
      gpa: {
        type: Sequelize.DECIMAL
      },
      joinDate: {
        type: Sequelize.DATEONLY
      },
      graduationDate: {
        type: Sequelize.DATEONLY
      },
      desc: {
        type: Sequelize.TEXT
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
    await queryInterface.addConstraint('UserEducationHistories', {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'user_education_history_user_id',
      references: {
        table: 'Users',
        field: 'id'
      }
    });
    
    await queryInterface.addConstraint('UserEducationHistories', {
      fields: ['educationLevel_id'],
      type: 'foreign key',
      name: 'user_education_history_educationLevel_id',
      references: {
        table: 'EducationLevels',
        field: 'id'
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('UserEducationHistories');
  }
};