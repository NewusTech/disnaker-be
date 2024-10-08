'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('UserProfiles', 'location', {
      type: Sequelize.STRING
    })
    await queryInterface.removeColumn('UserSkills', 'id');
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('UserProfiles', 'location')
    await queryInterface.addColumn('UserSkills', 'id', {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    })
  }
};
