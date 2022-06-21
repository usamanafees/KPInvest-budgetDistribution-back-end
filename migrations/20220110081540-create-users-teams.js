'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('UsersTeams', {
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
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('UsersTeams');
  }
};