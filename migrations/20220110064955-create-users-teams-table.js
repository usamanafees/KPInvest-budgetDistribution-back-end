'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
     return queryInterface.createTable(
      'UsersTeams',
      {
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE,
        },
        TeamId: {
          primaryKey: true,
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {    
            model: 'Teams',
            key: 'id'
            }
          },
        UserId: {
          primaryKey: true,
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {  
            model: 'Users',
            key: 'id'
          }
        }
      }
    );
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    // remove table
    return queryInterface.dropTable('UsersTeams');
  }
};
