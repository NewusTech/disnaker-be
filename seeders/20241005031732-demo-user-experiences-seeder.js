'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const WorkExperiences = [
      {
        user_id: 5,
        title: 'Software Engineer',
        possition: 'Junior Developer',
        companyName: 'PT Teknologi Nusantara',
        contractType: 'Full Time',
        joinDate: '2018-02-01',
        leaveDate: '2020-03-15',
        isCurrently: 'false',
        desc: 'Bekerja sebagai junior developer, mengembangkan aplikasi web dan mobile menggunakan berbagai teknologi seperti PHP dan Flutter.',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        user_id: 5,
        title: 'Lead Developer',
        possition: 'Team Lead',
        companyName: 'PT Inovasi Digital',
        contractType: 'Full Time',
        joinDate: '2020-04-01',
        leaveDate: '2023-06-30',
        isCurrently: 'false',
        desc: 'Memimpin tim pengembangan aplikasi dan bertanggung jawab atas desain serta arsitektur aplikasi di perusahaan.',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        user_id: 5,
        title: 'Senior Software Engineer',
        possition: 'Senior Developer',
        companyName: 'PT Solusi Teknologi',
        contractType: 'Full Time',
        joinDate: '2023-07-01',
        leaveDate: null,
        isCurrently: 'true',
        desc: 'Bertanggung jawab dalam pengembangan dan supervisi aplikasi backend dan frontend, serta mentoring bagi anggota tim junior.',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await queryInterface.bulkInsert('UserExperiences', WorkExperiences, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('UserExperiences', null, {});
  }
};