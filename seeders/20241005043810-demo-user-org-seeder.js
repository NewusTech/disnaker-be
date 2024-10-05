'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const userOrganizations = [
      {
        user_id: 5,
        name: 'Pengurus Inti',
        organizationName: 'Ikatan Pemuda Kreatif',
        joinDate: '2020-05-15',
        leaveDate: '2022-12-31',
        desc: 'Mengelola kegiatan kreatif pemuda dan menyelenggarakan berbagai acara sosial di lingkungan setempat.',
        isCurrently: 'false',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        user_id: 5,
        name: 'Anggota Tim',
        organizationName: 'Asosiasi Programmer Indonesia',
        joinDate: '2021-01-10',
        leaveDate: '2023-07-01',
        desc: 'Berkolaborasi dengan anggota lain dalam menyelenggarakan seminar dan pelatihan terkait pemrograman.',
        isCurrently: 'false',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        user_id: 5,
        name: 'Ketua Komite',
        organizationName: 'Komunitas Tech Enthusiast',
        joinDate: '2023-08-01',
        leaveDate: null,
        desc: 'Memimpin komunitas yang fokus pada pengembangan teknologi dan inovasi terbaru.',
        isCurrently: 'true',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await queryInterface.bulkInsert('UserOrganizations', userOrganizations, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('UserOrganizations', null, {});
  }
};
