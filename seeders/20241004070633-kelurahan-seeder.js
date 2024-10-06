'use strict';
const fs = require('fs');
const path = require('path');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const filePath = path.join(__dirname, '../factory/kelurahan.json');
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    const kelurahan = data.map(kelurahan => ({
      id: kelurahan.id,
      kecamatan_id: kelurahan.kecamatan_id,
      name: kelurahan.name,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    return queryInterface.bulkInsert('Kelurahans', kelurahan, {});
  },

  down: async (queryInterface, Sequelize) => {
    // Hapus data jika perlu
    return queryInterface.bulkDelete('Kelurahans', null, {});
  }
};
