'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Teams extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // Many To Many, 
      // through keyword will create junction table automatiaclly with given name
      Teams.belongsToMany(models.User, { as: 'users', through: 'UsersTeams' });
      // One to Many
      // Teams.hasMany(models.User, { as: 'employes'})
    }
  };
  Teams.init({
    teamName: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Teams',
  });
  return Teams;
};