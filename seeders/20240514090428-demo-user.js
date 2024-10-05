'use strict';

const passwordHash = require('password-hash');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const users = [
      {
        email: 'superadmin',
        password: passwordHash.generate('123456'),
        slug: "superadmin-20240620041615213",
        role_id: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'kreatifnusantara@nusacreative.com',
        password: passwordHash.generate('123456'),
        slug: "kreatifnusantara-20240620041615213",
        role_id: 3, // company
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'hr@tech.id',
        password: passwordHash.generate('123456'),
        slug: "hr-20240620041615213",
        role_id: 3, // company
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'solusipintar@work.id',
        password: passwordHash.generate('123456'),
        slug: "solusipintar-20240620041615213",
        role_id: 3, // company
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'fajarsetiawan@gmail.com',
        password: passwordHash.generate('123456'),
        slug: "fajarsetiawan-20240620041615213",
        role_id: 2, // user
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await queryInterface.bulkInsert('Users', users, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Users', null, {});
  }
};
