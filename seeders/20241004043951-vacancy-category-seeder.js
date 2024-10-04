'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('VacancyCategories', [
      {
        name: 'Komputer',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Sales',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Marketing',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Keuangan',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Pendidikan',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Administrasi',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Kesehatan',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Teknik',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Desain Grafis',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Sumber Daya Manusia (HR)',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Hukum',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Ritel',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Logistik',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Konstruksi',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Pariwisata',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Perhotelan',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Pertanian',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Pertambangan',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Media & Jurnalistik',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Pemerintahan',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Keamanan',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Pelayanan Publik',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Seni & Kreativitas',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ],);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('VacancyCategories', null, {});
  }
};
