'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('UserProfiles', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER,
      },
      name: {
        type: Sequelize.STRING
      },
      nik: {
        type: Sequelize.STRING,
        unique: true
      },
      department: {
        type: Sequelize.STRING
      },
      birthDate: {
        type: Sequelize.DATEONLY
      },
      birthPlace: {
        type: Sequelize.STRING
      },
      gender: {
        type: Sequelize.ENUM('Laki-laki', 'Perempuan')
      },
      religion : {
        type: Sequelize.STRING
      },
      profession: {
        type: Sequelize.STRING
      },
      maritalStatus: {
        type: Sequelize.STRING
      },
      citizenship: {
        type: Sequelize.STRING
      },
      address: {
        type: Sequelize.TEXT
      },
      employmentStatus: {
        type: Sequelize.STRING
      },
      phoneNumber: {
        type: Sequelize.STRING
      },
      about: {
        type: Sequelize.TEXT
      },
      cv: {
        type: Sequelize.STRING
      },
      portfolio: {
        type: Sequelize.STRING
      },
      slug: {
        type: Sequelize.STRING,
        unique: true
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
        type: Sequelize.DATE
      }
    });

    await queryInterface.addConstraint('UserProfiles', {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'custom_fkey_user_id',
      references: {
        table: 'Users',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('UserProfiles');
  }
};