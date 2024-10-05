'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('VacancyEducationLevels', [
      {
        vacancy_id: 1,
        educationLevel_id: 8,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        vacancy_id: 2,
        educationLevel_id: 8, // S2 (Magister)
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        vacancy_id: 3,
        educationLevel_id: 6, // D3 (Diploma)
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('VacancyEducationLevels', null, {});
  }
};
