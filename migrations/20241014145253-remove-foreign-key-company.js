'use strict';

const { query } = require('express');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.removeColumn('JobInvitations', 'company_id');
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.addColumn('JobInvitations', 'company_id', {
      type: Sequelize.INTEGER
    })
  }
};
