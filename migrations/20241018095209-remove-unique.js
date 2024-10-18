'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
   await queryInterface.removeColumn('RoleHasPermissions', 'role_id');
   await queryInterface.removeColumn('RoleHasPermissions', 'permission_id');

   await queryInterface.addColumn('RoleHasPermissions', 'role_id', {
     type: Sequelize.INTEGER
   })

   await queryInterface.addColumn('RoleHasPermissions', 'permission_id', {
     type: Sequelize.INTEGER
   })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('RoleHasPermissions', 'role_id');
    await queryInterface.removeColumn('RoleHasPermissions', 'permission_id');

    await queryInterface.addColumn('RoleHasPermissions', 'role_id', {
      type: Sequelize.INTEGER,
      unique: true
    });
    
    await queryInterface.addColumn('RoleHasPermissions', 'permission_id', {
      type: Sequelize.INTEGER,
      unique: true
    });
  }
};
