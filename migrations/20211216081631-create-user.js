'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      firstName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      lastName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      email: {
        type: Sequelize.STRING,
        unique: true
      },
      score: {
        type: Sequelize.INTEGER
      },
      participation_status: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      isActive: {
          type: Sequelize.BOOLEAN,
          defaultValue: true
      },
      link_key: {
        type: Sequelize.STRING
      },
      // TeamId: {
      //   type: Sequelize.INTEGER,
      //   allowNull: false,
      //   references: {         // User belongsTo Teams 1:N
      //     model: 'Teams',
      //     key: 'id'
      //   }
      // },
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
    await queryInterface.dropTable('Users');
  }
};