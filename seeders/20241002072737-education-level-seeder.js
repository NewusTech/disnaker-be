'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('EducationLevels', [
      {
        level: 'SD',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        level: 'SMP',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        level: 'SMA',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        level: 'D1',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        level: 'D2',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        level: 'D3',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        level: 'D4',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        level: 'S1',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        level: 'S2',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        level: 'S3',
        createdAt: new Date(),
        updatedAt: new Date()
        }
    ])
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('EducationLevels', null, {})
  }
};
