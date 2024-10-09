'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('TransmigrationMembers', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      transmigration_id: {
        type: Sequelize.INTEGER
      },
      nik: {
        type: Sequelize.STRING
      },
      name: {
        type: Sequelize.STRING
      },
      gender: {
        type: Sequelize.STRING
      },
      familyStatus: {
        type: Sequelize.STRING
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

    await queryInterface.addConstraint('TransmigrationMembers', {
      fields: ['transmigration_id'],
      type: 'foreign key',
      name: 'transmigration_id',
      references: {
        table: 'Transmigrations',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });
    await queryInterface.dropTable('TransmigationMembers');
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('TransmigrationMembers');
    await queryInterface.removeConstraint('TransmigrationMembers', 'transmigration_id');

    await queryInterface.createTable('TransmigationMembers', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      transmigration_id: {
        type: Sequelize.INTEGER
      },
      nik: {
        type: Sequelize.STRING
      },
      name: {
        type: Sequelize.STRING
      },
      gender: {
        type: Sequelize.STRING
      },
      familyStatus: {
        type: Sequelize.STRING
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
  }
};