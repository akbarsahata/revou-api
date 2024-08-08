const jwt = require('jsonwebtoken');

let id = 0;

const tasks = [];

function createTask(description) {
  const task = { id: ++id, description, isDone: false };

  tasks.push(task);

  return task;
}

function getTasks() {
  return tasks;
}

function getTask(id) {
  return tasks.find((task) => task.id === id);
}

function updateTask(id, description, isDone) {
  const task = getTask(id);

  if (task) {
    task.description = description || task.description;
    task.isDone = isDone || task.isDone;
  }

  return task;
}

function deleteTask(id) {
  const index = tasks.findIndex((task) => task.id === id);

  if (index !== -1) {
    tasks.splice(index, 1);
  }
}

const tokenWithTimestamp = {};

function generateToken() {
  const token = Math.random().toString(36).substring(2);

  tokenWithTimestamp[token] = Date.now() + 1000 * 60 * 5; // 5 minutes

  return token;
}

function validateToken(token) {
  if (!tokenWithTimestamp[token]) {
    return false;
  }

  if (tokenWithTimestamp[token] < Date.now()) {
    return false;
  }

  return true;
}

function generateJwt(data) {
  return  jwt.sign(data, 'secret', { expiresIn: '5m' });
}

function validateJwt(token) {
  try {
    return jwt.verify(token, 'secret');
  } catch {
    return false;
  }
}

module.exports = {
  taskModel: {
    createTask,
    getTasks,
    getTask,
    updateTask,
    deleteTask,
  },
  tokenHelper: {
    generateToken,
    validateToken,
  },
  jwtHelper: {
    generateJwt,
    validateJwt,
  },
};
