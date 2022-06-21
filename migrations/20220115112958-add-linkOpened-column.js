'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
     queryInterface.addColumn(
      'Users', // table name
      'link_opened', // new field name
      {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
    )    
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
     queryInterface.removeColumn('Users', 'link_opened')
  }
};
