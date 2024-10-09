'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('YellowCards', 'provinsi', {
      type: Sequelize.STRING
    });

    await queryInterface.addColumn('YellowCards', 'kabupaten', {
      type: Sequelize.STRING
    });

    await queryInterface.removeConstraint('YellowCards', 'yellowCards_kecamatan_id');
    await queryInterface.removeConstraint('YellowCards', 'yellowCards_kelurahan_id');
    await queryInterface.removeColumn('YellowCards', 'kecamatan_id');
    await queryInterface.removeColumn('YellowCards', 'kelurahan_id');

    await queryInterface.addColumn('YellowCards', 'kecamatan', {
      type: Sequelize.STRING
    });

    await queryInterface.addColumn('YellowCards', 'kelurahan', {
      type: Sequelize.STRING
    });
  },

  async down (queryInterface, Sequelize) {

    await queryInterface.removeColumn('YellowCards', 'provinsi');
    await queryInterface.removeColumn('YellowCards', 'kabupaten');
    await queryInterface.removeColumn('YellowCards', 'kecamatan');
    await queryInterface.removeColumn('YellowCards', 'kelurahan');

    await queryInterface.addColumn('YellowCards', 'kecamatan_id', {
      type: Sequelize.INTEGER
    });
    await queryInterface.addColumn('YellowCards', 'kelurahan_id', {
      type: Sequelize.INTEGER
    });

    await queryInterface.addConstraint('YellowCards', {
      fields: ['kecamatan_id'],
      type: 'foreign key',
      name: 'yellowCards_kecamatan_id',
      references: {
        table: 'Kecamatans', // Pastikan ini nama tabel yang benar
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });

    await queryInterface.addConstraint('YellowCards', {
      fields: ['kelurahan_id'],
      type: 'foreign key',
      name: 'yellowCards_kelurahan_id',
      references: {
        table: 'Kelurahans', // Pastikan ini nama tabel yang benar
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });
  }

};
