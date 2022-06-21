'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
    // await queryInterface.bulkInsert('Teams', [
    //   { 
    //     teamName: 'PM',
    //     createdAt: new Date(),
    //     updatedAt: new Date()
    //   },
    //   {
    //     teamName: "A-Line",
    //     createdAt: new Date(),
    //     updatedAt: new Date()
    //   },
    //   {
    //     teamName: "Accounting",
    //     createdAt: new Date(),
    //     updatedAt: new Date()
    //   },
    //   {
    //     teamName: "Nuclear",
    //     createdAt: new Date(),
    //     updatedAt: new Date()
    //   },
    //   {
    //     teamName: "People Ops",
    //     createdAt: new Date(),
    //     updatedAt: new Date()
    //   }
    // ], {});

  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};
