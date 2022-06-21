'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Ratings', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      score: {
        type: Sequelize.INTEGER
      },
      appliedPercent: {
        type: Sequelize.DOUBLE
      },
      ratingFrom: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {    
          model: 'Users',
          key: 'id'
        }
      },
      ratingTo: {
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
    await queryInterface.dropTable('Ratings');
  }
};