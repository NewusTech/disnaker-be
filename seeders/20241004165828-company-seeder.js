'use strict';

const { deprecationHandler } = require('moment-timezone');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Companies', [
      {
        user_id: 3,
        name: 'PT. Tech Indonesia',
        department:'Komputer',
        desc: 'Perusahaan yang bergerak di bidang teknologi dan inovasi digital.',
        address: 'Jl. Merdeka No. 123, Jakarta',
        numberEmployee: 150,
        website: 'https://www.techindonesia.com',
        instagram: '@techindonesia',
        imageLogo: 'https://example.com/logo-techindonesia.png',
        imageBanner: 'https://example.com/banner-techindonesia.png',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        user_id: 2,
        name: 'PT. Kreatif Nusantara',
        department:'Komputer',
        desc: 'Perusahaan yang fokus pada industri kreatif dan desain.',
        address: 'Jl. Sudirman No. 45, Bandung',
        numberEmployee: 75,
        website: 'https://www.kreatifnusantara.com',
        instagram: '@kreatifnusantara',
        imageLogo: 'https://example.com/logo-kreatifnusantara.png',
        imageBanner: 'https://example.com/banner-kreatifnusantara.png',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        user_id: 4,
        name: 'PT. Solusi Pintar',
        department:'Komputer',
        desc: 'Penyedia solusi IT dan pengembangan perangkat lunak.',
        address: 'Jl. Diponegoro No. 78, Surabaya',
        numberEmployee: 200,
        website: 'https://www.solusipintar.com',
        instagram: '@solusipintar',
        imageLogo: 'https://example.com/logo-solusipintar.png',
        imageBanner: 'https://example.com/banner-solusipintar.png',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Companies',null, {});
  }
};
