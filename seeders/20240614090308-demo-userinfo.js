'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const UserProfiles = [
      {
        user_id: 1,
        name: 'Super Admin',
        nik: 'superadmin',
        phoneNumber: '081234567890',
        slug: "superadmin-20240620041615213",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        user_id: 2,
        name: 'PT. Kreatif Nusantara',
        phoneNumber: '081234567890',
        slug: 'kreatifnusantara'+ new Date().getTime(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        user_id: 3,
        name: 'PT. Tech Indonesia',
        phoneNumber: '081234567890',
        slug: 'techindonesia'+ new Date().getTime(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        user_id: 4,
        name:'PT. Solusi Pintar',
        phoneNumber: '081234567890',
        slug: 'solusipintar'+ new Date().getTime(),
        createdAt: new Date(),
        updatedAt: new Date()
      }, 
      {
        user_id: 5,
        name:'Fajar Setiawan',
        nik: '18110911000001',
        department: "Komputer",
        phoneNumber: '081234567890',
        birthDate: '1996-01-01',
        slug: 'fajarsetiawan'+ new Date().getTime(),
        gender: 'Laki-laki',
        address: 'Jl. Merdeka No. 123, Jakarta',
        phoneNumber: '081234567890',
        about: 'Seorang profesional di bidang IT dengan pengalaman 5 tahun.',
        cv: 'https://example.com/cv/budi.pdf',
        portfolio: 'https://example.com/portfolio/budi',
        birthPlace: 'Jakarta',
        religion: 'Islam',
        profession: 'Software Engineer',
        employmentStatus: 'Sudah Bekerja',
        maritalStatus: 'Menikah',
        citizenship: 'WNI',
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await queryInterface.bulkInsert('UserProfiles', UserProfiles, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('UserProfiles', null, {});
  }
};
