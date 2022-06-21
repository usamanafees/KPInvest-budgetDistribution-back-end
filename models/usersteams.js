'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UsersTeams extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.User.belongsToMany(models.Teams, { through: 'UsersTeams' });
      models.Teams.belongsToMany(models.User, { through: 'UsersTeams' });
    }
  };
  UsersTeams.init({
    TeamId: DataTypes.INTEGER,
    UserId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'UsersTeams',
  });
  return UsersTeams;
};