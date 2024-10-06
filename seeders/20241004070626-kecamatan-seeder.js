'use strict';
const fs = require('fs');
const path = require('path');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const filePath = path.join(__dirname, '../factory/kecamatan.json');
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    const kecamatan = data.map(kecamatan => ({
      id: kecamatan.id,
      kabupaten_id: kecamatan.kabupaten_id,
      name: kecamatan.name,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    return queryInterface.bulkInsert('Kecamatans', kecamatan, {});
  },

  down: async (queryInterface, Sequelize) => {
    // Hapus data jika perlu
    return queryInterface.bulkDelete('Kecamatans', null, {});
  }
};
