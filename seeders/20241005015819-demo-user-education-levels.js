'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('UserEducationHistories', [
      {
        user_id: 5,
        educationLevel_id: 8,
        instanceName: 'Institut Teknologi Bandung',
        department: 'Informatika',
        gpa: 3.71,
        joinDate: '2017-08-15',
        graduationDate: '2021-11-23',
        desc: 'Saya lulus pada 2017 dan mengambil jurusan informatika. Saya mengambil jurusan informatika karena saya ingin menambah pengalaman kerja yang lebih luas.',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('UserEducationLevels', null, {});
  }
};
