'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('KebijakanPrivasis', [
      {
        id: 1,
        title: 'Kebijakan Privasi',
        desc: `<p>Kebijakan Privasi Aplikasi Dinas Tenaga Kerja (Disnaker) Kabupaten Tanggamus

1. Pengantar
Kami di Dinas Tenaga Kerja Kabupaten Tanggamus berkomitmen untuk melindungi privasi dan kerahasiaan data pribadi Anda. Kebijakan privasi ini menjelaskan cara kami mengumpulkan, menggunakan, menyimpan, dan melindungi informasi pribadi yang Anda berikan melalui aplikasi ini. Dengan menggunakan aplikasi Disnaker, Anda menyetujui pengumpulan dan penggunaan data sebagaimana dijelaskan dalam kebijakan ini.

2. Informasi yang Kami Kumpulkan
Saat Anda menggunakan aplikasi kami, kami dapat mengumpulkan informasi pribadi yang diperlukan untuk memberikan layanan ketenagakerjaan yang lebih baik. Informasi yang mungkin kami kumpulkan meliputi, namun tidak terbatas pada:

Nama lengkap
Alamat email
Nomor telepon
Data identifikasi (KTP, nomor pegawai, atau nomor registrasi lainnya)
Informasi pekerjaan (posisi, perusahaan, riwayat pekerjaan)
Data lokasi (untuk tujuan tertentu seperti menemukan lowongan kerja di sekitar)
Kami juga dapat mengumpulkan informasi lain yang bersifat anonim atau tidak dapat diidentifikasi secara langsung dengan pengguna untuk keperluan analisis dan peningkatan layanan.

3. Penggunaan Informasi
Informasi pribadi yang kami kumpulkan akan digunakan untuk:

Menyediakan layanan ketenagakerjaan yang lebih baik dan efisien
Mengelola akun dan preferensi Anda di aplikasi
Memproses pendaftaran pencari kerja, pelatihan, dan layanan lain yang terkait dengan ketenagakerjaan
Menghubungi Anda terkait pembaruan, pengingat, atau pemberitahuan terkait layanan
Memenuhi persyaratan hukum atau peraturan yang berlaku
Kami tidak akan menggunakan informasi pribadi Anda untuk tujuan lain tanpa persetujuan Anda, kecuali diwajibkan oleh hukum.

4. Penyimpanan Data
Data pribadi Anda akan disimpan dengan aman selama diperlukan untuk memberikan layanan yang diminta atau selama diwajibkan oleh hukum. Kami akan menghapus atau menganonimkan data pribadi Anda ketika tidak lagi diperlukan.

5. Pengungkapan Informasi Kepada Pihak Ketiga
Kami tidak akan membagikan informasi pribadi Anda kepada pihak ketiga tanpa persetujuan Anda, kecuali dalam situasi tertentu seperti:

Ketika diperlukan untuk memproses layanan (misalnya bekerja sama dengan mitra pelatihan atau perusahaan)
Jika diwajibkan oleh undang-undang atau peraturan yang berlaku
Dalam situasi darurat untuk melindungi keselamatan pengguna atau kepentingan publik
Semua pihak ketiga yang bekerja sama dengan kami diwajibkan untuk mematuhi kebijakan privasi ini dan menjaga kerahasiaan informasi Anda.

6. Keamanan Data
Kami mengimplementasikan langkah-langkah keamanan teknis dan organisasi yang wajar untuk melindungi data pribadi Anda dari akses, pengungkapan, atau penggunaan yang tidak sah. Meskipun demikian, harap dipahami bahwa tidak ada metode transmisi data di internet atau sistem penyimpanan elektronik yang 100% aman. Kami berkomitmen untuk terus meningkatkan keamanan kami, namun kami tidak dapat menjamin keamanan sepenuhnya.

7. Hak Pengguna
Anda memiliki hak-hak berikut sehubungan dengan data pribadi Anda:

Hak Akses: Anda dapat meminta salinan data pribadi Anda yang kami simpan.
Hak Pembetulan: Anda dapat meminta perbaikan jika informasi yang kami miliki tidak akurat atau tidak lengkap.
Hak Penghapusan: Anda dapat meminta penghapusan data pribadi Anda jika tidak lagi diperlukan untuk tujuan yang telah disebutkan, kecuali ada kewajiban hukum yang mengharuskan penyimpanannya.
Hak Menarik Persetujuan: Anda dapat menarik persetujuan Anda kapan saja jika Anda telah memberikan izin khusus untuk penggunaan data Anda di luar keperluan layanan.
Untuk mengakses hak-hak ini, Anda dapat menghubungi kami melalui kontak yang disediakan.

8. Perubahan Kebijakan Privasi
Kami berhak untuk mengubah atau memperbarui Kebijakan Privasi ini kapan saja. Perubahan akan diberlakukan segera setelah diumumkan melalui aplikasi atau situs web kami. Kami akan memberi tahu Anda melalui notifikasi di aplikasi jika ada perubahan signifikan terkait perlindungan data pribadi Anda.

9. Hubungi Kami
Jika Anda memiliki pertanyaan atau kekhawatiran tentang Kebijakan Privasi ini atau mengenai cara kami menangani informasi pribadi Anda, jangan ragu untuk menghubungi Dinas Tenaga Kerja Kabupaten Tanggamus melalui nomor yang tertera di website.</p>`,
        createdAt: new Date(),
        updatedAt: new Date()
      },
    ], {})
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('KebijakanPrivasis', null, {})
  }
};
