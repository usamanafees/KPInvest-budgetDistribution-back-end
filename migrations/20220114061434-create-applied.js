'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Applied', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      appliedPercent: {
        type: Sequelize.FLOAT
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
    await queryInterface.dropTable('Applied');
  }
};