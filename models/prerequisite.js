const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Prerequisites = sequelize.define(
  'Prerequisites',
  {
    courseId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    prerequisiteId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

module.exports = Prerequisites;
