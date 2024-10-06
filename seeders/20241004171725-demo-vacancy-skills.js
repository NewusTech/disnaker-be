'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('VacancySkills', [
      {
        vacancy_id: 1,
        skill_id: 1, // Skill 1 untuk Vacancy 1
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        vacancy_id: 1,
        skill_id: 5, // Skill 2 untuk Vacancy 1
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        vacancy_id: 2,
        skill_id: 15, // Skill 3 untuk Vacancy 2
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        vacancy_id: 3,
        skill_id: 9, // Skill 4 untuk Vacancy 3
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        vacancy_id: 3,
        skill_id: 18, // Skill 5 untuk Vacancy 3
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('VacancySkills', null, {});
  }
};
