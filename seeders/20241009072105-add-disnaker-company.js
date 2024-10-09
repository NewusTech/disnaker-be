'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Companies', [
      {
        user_id: 1,
        name: 'Disnaker Tanggamus',
        department:'Pemerintahan',
        desc: 'Dinas Tenaga Kerja Kabupaten Tanggamus, Provinsi Lampung.',
        address: 'Jl. Jend. Suprapto, Kp. Baru, Kec. Kota Agung Tim., Kabupaten Tanggamus, Lampung 35384',
        numberEmployee: 100,
        website: 'https://disnaker.tanggamus.go.id/',
        instagram: '@disnakertgms',
        imageLogo: 'https://disnaker.tanggamus.go.id/assets/logo-tanggamus.png',
        imageBanner: 'https://wisatalampung.id/blog/wp-content/uploads/2023/04/tanggamus.jpg',
        createdAt: new Date(),
        updatedAt: new Date()
      },
    ])
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Companies', null, {});
  }
};
