'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Vacancies', [
      {
        category_id: 1,
        company_id: 1,
        title: 'Software Engineer',
        slug: 'software-engineer',
        desc: 'Bertanggung jawab untuk mengembangkan dan memelihara aplikasi software.',
        responsibility: 'Membuat kode yang efisien dan scalable.',
        requirement: 'Pengalaman minimal 2 tahun dalam pengembangan software.',
        gender: 'Laki-laki',
        minExperience: 2,
        maxAge: 35,
        workingDay: 'Senin - Jumat',
        workingHour: '08:00 - 17:00',
        jobType: 'Full Time',
        workLocation: 'Onsite',
        isPublished: 'true',
        applicationDeadline: '2024-12-31',
        salary: 8000000,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        category_id: 1,
        company_id: 2,
        title: 'UI/UX Designer',
        slug: 'ui-ux-designer',
        desc: 'Merancang pengalaman pengguna yang menarik dan mudah digunakan.',
        responsibility: 'Menciptakan prototipe dan desain antarmuka yang interaktif.',
        requirement: 'Pengalaman minimal 1 tahun di bidang desain UI/UX.',
        gender: 'Perempuan',
        minExperience: 1,
        maxAge: 30,
        workingDay: 'Senin - Jumat',
        workingHour: '09:00 - 18:00',
        jobType: 'Part Time',
        workLocation: 'Remote',
        isPublished: 'false',
        applicationDeadline: '2024-11-15',
        salary: 5000000,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        category_id: 1,
        company_id: 3,
        title: 'Digital Marketing Specialist',
        slug: 'digital-marketing-specialist',
        desc: 'Bertanggung jawab atas pemasaran digital dan manajemen kampanye iklan online.',
        responsibility: 'Mengelola dan menganalisis kinerja kampanye iklan di platform digital.',
        requirement: 'Pengalaman minimal 3 tahun dalam pemasaran digital.',
        gender: 'Laki-laki',
        minExperience: 3,
        maxAge: 40,
        workingDay: 'Senin - Sabtu',
        workingHour: '09:00 - 17:00',
        jobType: 'Freelance',
        workLocation: 'Hybrid',
        isPublished: 'true',
        applicationDeadline: '2024-10-31',
        salary: 6000000,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Vacancies', null, {});
  }
};
