'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('YellowCardSkills', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      yellowCard_id: {
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

    await queryInterface.addConstraint('YellowCardSkills', {
      fields: ['yellowCard_id'],
      type: 'foreign key',
      name: 'custom_fkey_yellowCard_id23',
      references: { 
        table: 'YellowCards',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });

    await queryInterface.addConstraint('YellowCardSkills', {
      fields: ['skill_id'],
      type: 'foreign key',
      name: 'custom_fkey_skill_id23',
      references: { 
        table: 'Skills',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('YellowCardSkills');
  }
};