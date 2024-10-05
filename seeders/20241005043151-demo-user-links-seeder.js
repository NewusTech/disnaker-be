'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const UserLinks = [
      {
        user_id: 5,
        link: 'https://portfolio-user1.com',
        linkType: 'portfolio',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        user_id: 5,
        link: 'https://instagram.com/user1',
        linkType: 'instagram',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        user_id: 5,
        link: 'https://linkedin.com/in/user1',
        linkType: 'linkedin',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        user_id: 5,
        link: 'https://twitter.com/user1',
        linkType: 'twitter',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        user_id: 5,
        link: 'https://facebook.com/user1',
        linkType: 'facebook',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await queryInterface.bulkInsert('UserLinks', UserLinks, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('UserLinks', null, {});
  }
};
