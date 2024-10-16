'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('YellowCards', 'user_id', {
      type: Sequelize.INTEGER
    })
    await queryInterface.addConstraint('YellowCards', {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'yellowCards_user_id',
      references: {
        table: 'Users', // Pastikan ini nama tabel yang benar
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('YellowCards', 'user_id')
  }
};
