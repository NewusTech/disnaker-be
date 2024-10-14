'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Events', 'category_id', {
      type: Sequelize.INTEGER,
    })
    await queryInterface.addConstraint('Events', {
      fields: ['category_id'],
      type: 'foreign key',
      name: 'event_category_id',
      references: {
        table: 'VacancyCategories',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Events', 'category_id')
  }
};
