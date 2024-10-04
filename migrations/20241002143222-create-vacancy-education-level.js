'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('VacancyEducationLevels', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      vacancy_id: {
        type: Sequelize.INTEGER
      },
      educationLevel_id: {
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

    await queryInterface.addConstraint('VacancyEducationLevels', {
      fields: ['vacancy_id'],
      type: 'foreign key',
      name: 'custom_fkey_vacancy_id23',
      references: { 
        table: 'Vacancies',
        field: 'id'
      },  
    });

    await queryInterface.addConstraint('VacancyEducationLevels', {
      fields: ['educationLevel_id'],
      type: 'foreign key',
      name: 'custom_fkey_educationLevel_id23',
      references: { 
        table: 'EducationLevels',
        field: 'id'
      },  
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('VacancyEducationLevels');
  }
};