'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Transmigrations', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      submissionNumber: {
        type: Sequelize.STRING
      },
      domicile: {
        type: Sequelize.TEXT
      },
      kecamatan_id: {
        type: Sequelize.INTEGER
      },
      kelurahan_id: {
        type: Sequelize.INTEGER
      },
      provinsi_id: {
        type: Sequelize.INTEGER
      },
      kabupaten_id: {
        type: Sequelize.INTEGER
      },
      status: {
        type: Sequelize.ENUM('Pengajuan', 'Proses', 'Terbit', 'Diterima', 'Ditolak')
      },
      kk: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    await queryInterface.addConstraint('Transmigrations', {
      fields: ['kecamatan_id'],
      type: 'foreign key',
      name: 'custom_fkey_kecamatan_id',
      references: {
        table: 'Kecamatans',
        field: 'id'
      }
    });
    await queryInterface.addConstraint('Transmigrations', {
      fields: ['kelurahan_id'],
      type: 'foreign key',
      name: 'custom_fkey_kelurahan_id',
      references: {
        table: 'Kelurahans',
        field: 'id'
      }
    });
    await queryInterface.addConstraint('Transmigrations', {
      fields: ['provinsi_id'],
      type: 'foreign key',
      name: 'custom_fkey_provinsi_id',
      references: {
        table: 'Provinsis',
        field: 'id'
      }
    });
    await queryInterface.addConstraint('Transmigrations', {
      fields: ['kabupaten_id'],
      type: 'foreign key',
      name: 'custom_fkey_kabupaten_id',
      references: {
        table: 'Kabupatens',
        field: 'id'
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Transmigrations');
  }
};