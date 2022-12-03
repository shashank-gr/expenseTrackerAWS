const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../util/database");

const FileLink = sequelize.define("fileLink", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  fileURL: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

module.exports = FileLink;
