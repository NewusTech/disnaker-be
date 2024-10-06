'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('UserCertificates', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING
      },
      organization: {
        type: Sequelize.STRING
      },
      file:{
        type: Sequelize.STRING
      },      
      expiredDate: {
        type: Sequelize.DATEONLY
      },
      isNonExpire: {
        type: Sequelize.ENUM('true', 'false')
      },
      desc: {
        type: Sequelize.TEXT
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

    await queryInterface.addConstraint('UserCertificates', {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'custom_fkey_user_id23',
      references: {
        table: 'Users',
        field: 'id'
      },
      
    })
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('UserCertificates');
  }
};