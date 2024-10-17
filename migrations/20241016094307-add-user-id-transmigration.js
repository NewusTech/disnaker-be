'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Transmigrations', 'user_id', {
      type: Sequelize.INTEGER
    });
    await queryInterface.addConstraint('Transmigrations', {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'transmigrations_user_id',
      references: {
        table: 'Users', // Pastikan ini nama tabel yang benar
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Transmigrations', 'user_id');
  }
};
