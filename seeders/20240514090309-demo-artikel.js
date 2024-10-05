'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const Artikels = [
      {
        title: 'Disnaker Lampung Gelar Pelatihan Ketenagakerjaan 2024',
        slug: 'disnaker-lampung-gelar-pelatihan-ketenagakerjaan-2024',
        desc: 'Dinas Ketenagakerjaan Lampung Utara mengadakan pelatihan ketenagakerjaan pada tahun 2024 untuk meningkatkan keterampilan dan kualitas tenaga kerja lokal.',
        kategori_id: 1,
        image: 'https://newus-bucket.s3.ap-southeast-2.amazonaws.com/superapps/assets/pelatihan-disnaker.png',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Disnaker Sosialisasi Program Kartu Prakerja 2024',
        slug: 'disnaker-sosialisasi-program-kartu-prakerja-2024',
        desc: 'Disnaker Lampung menyelenggarakan sosialisasi mengenai Program Kartu Prakerja untuk mendukung peningkatan skill dan lapangan kerja bagi masyarakat.',
        kategori_id: 2,
        image: 'https://newus-bucket.s3.ap-southeast-2.amazonaws.com/superapps/assets/kartu-prakerja.png',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Pameran Kesempatan Kerja oleh Disnaker di Tahun 2024',
        slug: 'pameran-kesempatan-kerja-oleh-disnaker-2024',
        desc: 'Disnaker Lampung Utara menggelar pameran kesempatan kerja pada tahun 2024 untuk mempertemukan pencari kerja dan perusahaan-perusahaan lokal yang membutuhkan tenaga kerja.',
        kategori_id: 1,
        image: 'https://newus-bucket.s3.ap-southeast-2.amazonaws.com/superapps/assets/job-fair.png',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await queryInterface.bulkInsert('Artikels', Artikels, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Artikels', null, {});
  }
};
