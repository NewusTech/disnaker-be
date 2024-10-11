'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Events', 'startDate', {
      type: Sequelize.DATEONLY
    });
    
    await queryInterface.addColumn('Events', 'company_id', {
      type: Sequelize.INTEGER
    });

    await queryInterface.addColumn('Events', 'endDate', {
      type: Sequelize.DATEONLY
    });

    await queryInterface.addColumn('Events', 'time', {
      type: Sequelize.STRING
    });

    await queryInterface.addColumn('Events', 'location', {
      type: Sequelize.STRING
    });

    await queryInterface.addColumn('Events', 'regisLink', {
      type: Sequelize.STRING
    });

    await queryInterface.addColumn('Events', 'phoneNumber', {
      type: Sequelize.STRING
    });

    await queryInterface.addConstraint('Events', {
      fields: ['company_id'],
      type: 'foreign key',
      name: 'event_company_id',
      references: {
        table: 'Companies',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });
  },

async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Events', 'startDate');
    await queryInterface.removeColumn('Events', 'endDate');
    await queryInterface.removeColumn('Events', 'company_id');
    await queryInterface.removeColumn('Events', 'time');
    await queryInterface.removeColumn('Events', 'location');
    await queryInterface.removeColumn('Events', 'regisLink');
    await queryInterface.removeColumn('Events', 'phoneNumber');

    await queryInterface.removeConstraint('Events', 'event_company_id');
  }
};
