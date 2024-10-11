'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.changeColumn('Applications', 'status', {
      type: Sequelize.STRING
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.changeColumn('Applications', 'status', {
      type: Sequelize.ENUM('Pengajuan', 'Proses', 'Terbit', 'Diterima', 'Ditolak')
    })
  }
};
