'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Vacancies', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      category_id: {
        type: Sequelize.INTEGER
      },
      company_id: {
        type: Sequelize.INTEGER
      },
      title: {
        type: Sequelize.STRING
      },
      desc: {
        type: Sequelize.TEXT
      },
      responsibility: {
        type: Sequelize.TEXT
      },
      requirement: {
        type: Sequelize.TEXT
      },
      gender: {
        type: Sequelize.ENUM('Laki-laki', 'Perempuan')
      },
      minExperience: {
        type: Sequelize.INTEGER
      },
      maxAge: {
        type: Sequelize.INTEGER
      },
      workingDay: {
        type: Sequelize.STRING
      },
      workingHour: {
        type: Sequelize.STRING
      },
      jobType: {
        type: Sequelize.ENUM('Full Time', 'Part Time', 'Freelance')
      },
      workLocation: {
        type: Sequelize.ENUM('Onsite', 'Remote', 'Hybrid')
      },
      applicationDeadline: {
        type: Sequelize.DATEONLY
      },
      salary: {
        type: Sequelize.DECIMAL
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

    await queryInterface.addConstraint('Vacancies', {
      fields: ['category_id'],
      type: 'foreign key',
      name: 'custom_fkey_category_id',
      references: {
        table: 'VacancyCategories',
        field: 'id'
      }
    });

    await queryInterface.addConstraint('Vacancies', {
      fields: ['company_id'],
      type: 'foreign key',
      name: 'custom_fkey_company_id',
      references: {
        table: 'Companies',
        field: 'id'
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Vacancies');
  }
};