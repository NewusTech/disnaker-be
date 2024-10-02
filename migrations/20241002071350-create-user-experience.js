'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('UserExperiences', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER
      },
      title: {
        type: Sequelize.STRING
      },
      possition: {
        type: Sequelize.STRING
      },
      companyName: {
        type: Sequelize.STRING
      },
      contractType: {
        type: Sequelize.STRING
      },
      joinDate: {
        type: Sequelize.DATEONLY
      },
      leaveDate: {
        type: Sequelize.DATEONLY
      },
      isCurrently: {
        type: Sequelize.ENUM('true', 'false')
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

    await queryInterface.addConstraint('UserExperiences', {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'custom_fkey_user_id24',
      references: {
        table: 'Users',
        field: 'id'
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('UserExperiences');
  }
};