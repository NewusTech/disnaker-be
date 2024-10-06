'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Events', [
      {
        title: 'Job Fair 2024',
        slug: 'job-fair-2024',
        desc: 'Acara Job Fair yang diselenggarakan oleh Dinas Tenaga Kerja untuk mempertemukan perusahaan dengan pencari kerja. Akan ada lebih dari 50 perusahaan dari berbagai sektor yang berpartisipasi.',
        image: 'https://jobfair-assets.kemnaker.go.id/event_galleries/23e89289-aa76-4129-82e9-30febebf5ac2/iPr0woRK6lPUvRaHLcxTtq0VWhBMU3oGirsKXBAD.jpg',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Pelatihan Keterampilan Digital',
        slug: 'pelatihan-keterampilan-digital',
        desc:'Program pelatihan yang dirancang untuk meningkatkan keterampilan digital, seperti desain grafis, pengembangan web, dan pemasaran digital, bagi para pencari kerja. Acara ini gratis dan terbuka untuk umum.',
        image:'https://jobfair-assets.kemnaker.go.id/event_galleries/23e89289-aa76-4129-82e9-30febebf5ac2/iPr0woRK6lPUvRaHLcxTtq0VWhBMU3oGirsKXBAD.jpg',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Seminar Keselamatan dan Kesehatan Kerja (K3)',
        slug: 'seminar-keselamatan-dan-kesehatan-kerja-k3',
        desc: 'Seminar edukasi mengenai pentingnya keselamatan dan kesehatan kerja di lingkungan industri. Acara ini bertujuan untuk meningkatkan kesadaran perusahaan dan pekerja terkait standar K3.',
        image: 'https://jobfair-assets.kemnaker.go.id/event_galleries/23e89289-aa76-4129-82e9-30febebf5ac2/iPr0woRK6lPUvRaHLcxTtq0VWhBMU3oGirsKXBAD.jpg',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down (queryInterface, Sequelize) {
   await queryInterface.bulkDelete('Events', null, {});
  }
};
