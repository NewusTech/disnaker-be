'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('SyaratKetentuans', [
      {
        desc: "Syarat dan Ketentuan Penggunaan Layanan: Pengguna wajib menggunakan layanan ini sesuai dengan ketentuan yang berlaku. Setiap pelanggaran terhadap aturan yang ditetapkan dapat mengakibatkan penghentian akun tanpa pemberitahuan sebelumnya. Kerahasiaan Data: Kami berkomitmen untuk menjaga kerahasiaan data pribadi Anda. Namun, kami tidak bertanggung jawab atas kehilangan data yang diakibatkan oleh pihak ketiga yang tidak berwenang. Kepatuhan Hukum: Dengan menggunakan layanan ini, Anda menyetujui untuk mematuhi semua peraturan perundang-undangan yang berlaku di wilayah hukum tempat Anda mengakses layanan ini. Pembatasan Tanggung Jawab: Kami tidak bertanggung jawab atas kerugian atau kerusakan yang timbul akibat penggunaan layanan ini, termasuk tetapi tidak terbatas pada gangguan sistem, virus, atau akses tidak sah ke data pribadi. Perubahan Syarat dan Ketentuan: Kami berhak untuk mengubah syarat dan ketentuan ini kapan saja tanpa pemberitahuan sebelumnya. Perubahan akan efektif segera setelah dipublikasikan di situs ini. Pengguna Terdaftar: Pengguna wajib mendaftarkan diri dengan informasi yang akurat dan terkini. Akun yang ditemukan menggunakan informasi palsu akan ditangguhkan tanpa pemberitahuan. Hak Kekayaan Intelektual: Semua konten yang tersedia dalam layanan ini, termasuk teks, gambar, dan logo, adalah milik kami atau pihak ketiga yang memiliki lisensi. Penggunaan tanpa izin tertulis dilarang keras.",
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ])
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('SyaratKetentuans', null, {})
  }
};
