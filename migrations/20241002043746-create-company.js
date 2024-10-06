'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Companies', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true
      },
      name: {
        type: Sequelize.STRING
      },
      department: {
        type: Sequelize.STRING
      },
      desc: {
        type: Sequelize.TEXT
      },
      address: {
        type: Sequelize.STRING
      },
      numberEmployee: {
        type: Sequelize.INTEGER
      },
      website: {
        type: Sequelize.STRING
      },
      instagram: {
        type: Sequelize.STRING
      },
      imageLogo : {
        type: Sequelize.STRING
      },
      imageBanner : {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      deletedAt: {
        allowNull: true,
        type: Sequelize.DATE
      }
    });
    await queryInterface.addConstraint('Companies', {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'custom_fkey_user_id23',
      references: { 
        table: 'Users', 
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    })
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Companies');
  }
};