'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const Kategoriartikels = [
      {
        title: 'Nasional',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Daerah',
        createdAt: new Date(),
        updatedAt: new Date()
      },
    ];

    await queryInterface.bulkInsert('Kategoriartikels', Kategoriartikels, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Kategoriartikels', null, {});
  }
};
