'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Transmigrations', 'provinsi_id');
    await queryInterface.removeColumn('Transmigrations', 'kabupaten_id');
    await queryInterface.removeColumn('Transmigrations', 'kecamatan_id');
    await queryInterface.removeColumn('Transmigrations', 'kelurahan_id');

    await queryInterface.addColumn('Transmigrations', 'provinsi', {
      type: Sequelize.STRING
    }),

    await queryInterface.addColumn('Transmigrations', 'kabupaten', {
      type: Sequelize.STRING
    }),

    await queryInterface.addColumn('Transmigrations', 'kecamatan', {
      type: Sequelize.STRING
    }),

    await queryInterface.addColumn('Transmigrations', 'kelurahan', {
      type: Sequelize.STRING
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.addColumn('Transmigrations', 'provinsi_id', {
      type: Sequelize.INTEGER
    })

    await queryInterface.addColumn('Transmigrations', 'kabupaten_id', {
      type: Sequelize.INTEGER
    })

    await queryInterface.addColumn('Transmigrations', 'kecamatan_id', {
      type: Sequelize.INTEGER
    })

    await queryInterface.addColumn('Transmigrations', 'kelurahan_id', {
      type: Sequelize.INTEGER
    })

    await queryInterface.removeColumn('Transmigrations', 'provinsi');
    await queryInterface.removeColumn('Transmigrations', 'kabupaten');
    await queryInterface.removeColumn('Transmigrations', 'kecamatan');
    await queryInterface.removeColumn('Transmigrations', 'kelurahan');
  }
};
