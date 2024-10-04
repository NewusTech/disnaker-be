'use strict';
const fs = require('fs');
const path = require('path');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const filePath = path.join(__dirname, '../factory/kabupaten.json');
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    const Kabupaten = data.map(kabupaten => ({
      id: kabupaten.id,
      provinsi_id: kabupaten.provinsi_id,
      name: kabupaten.name,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    return queryInterface.bulkInsert('Kabupatens', Kabupaten, {});
  },

  down: async (queryInterface, Sequelize) => {
    // Hapus data jika perlu
    return queryInterface.bulkDelete('Kabupatens', null, {});
  }
};
