'use strict';
const fs = require('fs');
const path = require('path');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const filePath = path.join(__dirname, '../factory/provinsi.json');
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    const provinces = data.map(provinsi => ({
      id: provinsi.id,
      name: provinsi.name,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    return queryInterface.bulkInsert('Provinsis', provinces, {});
  },

  down: async (queryInterface, Sequelize) => {
    // Hapus data jika perlu
    return queryInterface.bulkDelete('Provinsis', null, {});
  }
};
