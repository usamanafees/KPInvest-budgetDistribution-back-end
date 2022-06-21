'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Applied extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Applied.belongsTo(models.User, { foreignKey: 'ratingFrom' })
      Applied.belongsTo(models.User, { foreignKey: 'ratingTo' })
    }
  };
  Applied.init({
    appliedPercent: DataTypes.FLOAT,
    ratingFrom: DataTypes.INTEGER,
    ratingTo: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Applied',
  });
  return Applied;
};