'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {

    await queryInterface.bulkInsert('Skills', [
      // Hard Skills
      {
        name: 'Web Developer',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Backend Developer',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Frontend Developer',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Fullstack Developer',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Mobile Developer',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Data Analisis',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Machine Learning',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Cyber Security',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Dev Ops',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Database Management',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Netwok Engineer',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Digital Marketing',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Desain Grafis',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Optimasi Mesin Pencari (SEO)',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Manajemen Proyek',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Penulisan Teknis',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Editing Video',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Desain UI/UX',
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // Soft Skills
      {
        name: 'Komunikasi',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Problem Solving',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Team Work',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Manajemen Waktu',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Adaptasi',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Kepemimpinan',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Berpikir Kritis',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Penyelesaian Konflik',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Kecerdasan Emosional',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Kreativitas',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Negosiasi',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Pengambilan Keputusan',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Keterampilan Interpersonal',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Public Speeking',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Attention to Detail',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down (queryInterface, Sequelize) {

  }
};
