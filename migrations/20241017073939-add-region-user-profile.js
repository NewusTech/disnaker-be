'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('UserProfiles', 'provinsi', {
      type: Sequelize.STRING
    });
    await queryInterface.addColumn('UserProfiles', 'kabupaten', {
      type: Sequelize.STRING
    });
    await queryInterface.addColumn('UserProfiles', 'kecamatan', {
      type: Sequelize.STRING
    });
    await queryInterface.addColumn('UserProfiles', 'kelurahan', {
      type: Sequelize.STRING
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('UserProfiles', 'provinsi');
    await queryInterface.removeColumn('UserProfiles', 'kabupaten');
    await queryInterface.removeColumn('UserProfiles', 'kecamatan');
    await queryInterface.removeColumn('UserProfiles', 'kelurahan');
  }
};
