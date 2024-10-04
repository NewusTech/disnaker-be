'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const UserProfiles = [
      {
        user_id: 1,
        name: 'Super Admin',
        nik: 'superadmin',
        phoneNumber: '081234567890',
        slug: "superadmin-20240620041615213",
        createdAt: new Date(),
        updatedAt: new Date()
      },
    ];

    await queryInterface.bulkInsert('UserProfiles', UserProfiles, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('UserProfiles', null, {});
  }
};
