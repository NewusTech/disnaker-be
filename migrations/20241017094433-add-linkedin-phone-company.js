'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Companies', 'linkedin', {
      type: Sequelize.STRING
    })
    await queryInterface.addColumn('Companies', 'phone', {
      type: Sequelize.STRING
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Companies', 'linkedin');
    await queryInterface.removeColumn('Companies', 'phone');
  }
};
