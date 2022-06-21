'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // Many To Many
      User.belongsToMany(models.Teams, { as: 'teams', through: 'UsersTeams' });
      // One to many
      // User.belongsTo(models.Teams, { foreignKey: 'TeamId', as: 'team'})
      // One To Many
      User.hasMany(models.Feedback, { as: 'feedbacks' })
      User.hasMany(models.Ratings, {foreignKey: 'ratingFrom', as: 'rating_from'})
      User.hasMany(models.Ratings, {foreignKey: 'ratingTo', as: 'rating_to'})
      User.hasMany(models.Applied, {foreignKey: 'ratingFrom'})
      User.hasMany(models.Applied, {foreignKey: 'ratingTo'})
    }
  };
  User.init({
    firstName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: {
          args: true,
          msg: 'This email address is aleady in use.',
          fields: [sequelize.fn('lower', sequelize.col('email'))]
        },
        validate: {
          isEmail: {
            args: true,
            msg: 'The email you entered is invalid format.'
          }  
        }
    },
    score: {
      type: DataTypes.INTEGER
    },
    participation_status: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    isActive: {
      type: DataTypes.BOOLEAN
    },
    link_key: {
      type: DataTypes.STRING
    },
    link_opened: {
      type: DataTypes.BOOLEAN
    }
  },
    {
    sequelize,
    modelName: 'User',
  });
  return User;
};