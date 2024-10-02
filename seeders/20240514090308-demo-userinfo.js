'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const Userinfos = [
      {
        name: 'Super Admin',
        nik: 'superadmin',
        slug: "superadmin-20240620041615213",
        createdAt: new Date(),
        updatedAt: new Date()
      },
    ];

    await queryInterface.bulkInsert('Userinfos', Userinfos, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Userinfos', null, {});
  }
};
