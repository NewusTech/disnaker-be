'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('SurveyKepuasans', [
      {
        user_id: 5,
        isEasyUse: '5',
        serviceTransparency: '4',
        appExperience: 'Baik dan Bagus',
        feedback: 'Di tingkatkan lagi',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        user_id: 5,
        isEasyUse: '5',
        serviceTransparency: '3',
        appExperience: 'Agak lemot',
        feedback: 'Di tingkatkan lagi',
        createdAt: new Date(),
        updatedAt: new Date()
      }, 
      {
        user_id: 5,
        isEasyUse: '5',
        serviceTransparency: '4',
        appExperience: 'Keren aplikasinya',
        feedback: 'Di tingkatkan lagi',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ])
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};
