'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('UserOrganizations', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING
      },
      organizationName: {
        type: Sequelize.STRING
      },
      joinDate: {
        type: Sequelize.DATEONLY
      },
      leaveDate: {
        type: Sequelize.DATEONLY
      },
      desc: {
        type: Sequelize.TEXT
      },
      isCurrently: {
        type: Sequelize.ENUM('true', 'false')
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

    await queryInterface.addConstraint('UserOrganizations', {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'custom_fkey_user_id23',
      references: {
        table: 'Users',
        field: 'id'
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('UserOrganizations');
  }
};