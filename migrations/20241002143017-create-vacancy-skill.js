'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('VacancySkills', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      vacancy_id: {
        type: Sequelize.INTEGER
      },
      skill_id: {
        type: Sequelize.INTEGER
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
    await queryInterface.addConstraint('VacancySkills', {
      fields: ['vacancy_id'],
      type: 'foreign key',
      name: 'custom_fkey_vacancy_id23',
      references: { 
        table: 'Vacancies',
        field: 'id'
      }
    });
    
    await queryInterface.addConstraint('VacancySkills', {
      fields: ['skill_id'],
      type: 'foreign key',
      name: 'custom_fkey_skill_id23',
      references: { 
        table: 'Skills',
        field: 'id'
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('VacancySkills');
  }
};