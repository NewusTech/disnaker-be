'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.changeColumn('RoleHasPermissions', 'role_id', {
      type: Sequelize.INTEGER
    })

    await queryInterface.changeColumn('RoleHasPermissions', 'permission_id', {
      type: Sequelize.INTEGER
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.changeColumn('RoleHasPermissions', 'role_id', {
      type: Sequelize.INTEGER,
      unique: true
    })

    await queryInterface.changeColumn('RoleHasPermissions', 'permission_id', {
      type: Sequelize.INTEGER,
      unique: true
    })
  }
};
