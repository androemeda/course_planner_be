const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Courses = sequelize.define(
  'Courses',
  {
    id: {
      primaryKey: true,
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

module.exports = Courses;