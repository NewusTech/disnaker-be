'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('RoleHasPermissions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      role_id: {
        unique: true,
        type: Sequelize.INTEGER
      },
      permission_id: {
        type: Sequelize.INTEGER,
        unique: true,
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
    await queryInterface.addConstraint('RoleHasPermissions', {
      fields: ['role_id'],
      type: 'foreign key',
      name: 'permission_role_id',
      references: {
        table: 'Roles',
        field: 'id'
      }
    });

    await queryInterface.addConstraint('RoleHasPermissions', {
      fields: ['permission_id'],
      type: 'foreign key',
      name: 'custom_fkey_permission_id_role',
      references: {
        table: 'Permissions',
        field: 'id'
      }
    });

  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('RoleHasPermissions');
  }
};