const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../util/database");

const ResetPass = sequelize.define("resetPass", {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false,
  },
  isResetActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
});

module.exports = ResetPass;
