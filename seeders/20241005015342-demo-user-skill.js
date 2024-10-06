'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('UserSkills', [
      {
        user_id: 5,
        skill_id: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        user_id: 5,
        skill_id: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        user_id: 2,
        skill_id: 15,
        createdAt: new Date(),
        updatedAt: new Date()
      },
    ])
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('UserSkills', null, {});
  }
};
