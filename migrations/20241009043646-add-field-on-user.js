'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('UserEducationHistories', 'ijazah', {
      type: Sequelize.STRING
    });
    await queryInterface.addColumn('UserEducationHistories', 'transkrip', {
      type: Sequelize.STRING
    });
    await queryInterface.addColumn('UserProfiles', 'kk', {
      type: Sequelize.STRING
    });
    await queryInterface.addColumn('UserProfiles', 'ktp', {
      type: Sequelize.STRING
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('UserEducationHistories', 'ijazah');
    await queryInterface.removeColumn('UserEducationHistories', 'transkrip');
    await queryInterface.removeColumn('UserProfiles', 'kk');
    await queryInterface.removeColumn('UserProfiles', 'ktp');
  }
};
