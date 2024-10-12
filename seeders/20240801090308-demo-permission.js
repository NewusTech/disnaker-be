'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const Permissions = [
      {
        name: 'Semua',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
      name: 'Kelola Dashboard',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: 'Kelola Data Pengguna',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: 'Kelola Instansi',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: 'Kelola Laporan',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: 'Kelola Event',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: 'Kelola SKM',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: 'Kelola Master Data',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: 'Kelola Pelayanan',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: 'Kelola Akun',
      createdAt: new Date(),
      updatedAt: new Date()
    },

    ];

    await queryInterface.bulkInsert('Permissions', Permissions, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Permissions', null, {});
  }
};
