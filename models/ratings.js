'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Ratings extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Ratings.belongsTo(models.User, { foreignKey: 'ratingFrom', as: 'rating_from' })
      Ratings.belongsTo(models.User, { foreignKey: 'ratingTo', as: 'rating_to' })
    }
  };
  Ratings.init({
    score: DataTypes.INTEGER,
    appliedPercent: DataTypes.DOUBLE,
    ratingFrom: DataTypes.INTEGER,
    ratingTo: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Ratings',
  });
  return Ratings;
};