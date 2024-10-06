'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('YellowCards', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      submissionNumber: {
        type: Sequelize.STRING
      },
      residance: {
        type: Sequelize.TEXT
      },
      kelurahan_id: {
        type: Sequelize.INTEGER
      },
      kecamatan_id: {
        type: Sequelize.INTEGER
      },
      educationLevel_id: {
        type: Sequelize.INTEGER
      },
      job: {
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.ENUM('Pengajuan', 'Proses', 'Terbit', 'Ditolak')
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

    await queryInterface.addConstraint('YellowCards', {
      fields: ['kecamatan_id'],
      type: 'foreign key',
      name: 'yellowCards_kecamatan_id',
      references: {
        table: 'Kecamatans',
        field: 'id'
      }
    });

    await queryInterface.addConstraint('YellowCards', {
      fields: ['kelurahan_id'],
      type: 'foreign key',
      name: 'yellowCards_kelurahan_id',
      references: {
        table: 'Kelurahans',
        field: 'id'
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('YellowCards');
  }
};