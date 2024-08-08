const { DataTypes } = require('sequelize');
const db = require('.');

const Task = db.define('task', {
  id: {
    type: DataTypes.UUIDV4,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  description: DataTypes.STRING,
  isDone: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_done',
  },
}, { tableName: 'task', timestamps: false });

module.exports = Task;