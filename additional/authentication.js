require("dotenv").config();

const { taskModel, tokenHelper, jwtHelper } = require("./util");

const express = require("express");

const app = express();

app.use(express.json());

app.get("/tasks", function (request, response) {
  const tasks = taskModel.getTasks();

  return {
    data: tasks,
    count: tasks.length,
  };
});

app.get("/tasks/:id", function (request, response) {
  if (!Number(request.params.id)) {
    return response.status(400).json({ message: "Invalid ID" });
  }

  const id = Number(request.params.id);

  const task = taskModel.getTask(id);

  if (!task) {
    return response.status(404).json({ message: "Task not found" });
  }

  return {
    data: task,
  };
});

app.post("/tasks", function (request, response) {
  const description = request.body.description;

  if (!description) {
    response.status(400).json({ message: "Description is required" });
  }

  const task = taskModel.createTask(description);

  response.status(201).json({
    data: task,
  });
});

app.put("/tasks/:id", function (request, response) {
  const id = Number(request.params.id);
  const description = request.body.description;
  const isDone = request.body.isDone;

  const task = taskModel.updateTask(id, description, isDone);

  if (!task) {
    return response.status(404).json({ message: "Task not found" });
  }

  return response.status(200).json({
    data: task,
  });
});

app.delete("/tasks/:id", function (request, response) {
  const id = Number(request.params.id);

  taskModel.deleteTask(id);

  response.status(204).json();
});

app.get("/", function (request, response) {
  return response.json({ message: "Welcome to the Task API" });
});

app.post("/login", function (request, response) {
  const { username, password } = request.body;

  if (username === process.env.USERNAME && password === process.env.PASSWORD) {
    response.status(201).json({
      token: tokenHelper.generateToken(),
    });
  }

  response.status(401).json({ message: "Invalid credentials" });
});

app.post("/login-v2", function (request, response) {
  const { username, password } = request.body;

  if (username === process.env.USERNAME && password === process.env.PASSWORD) {
    return response.status(201).json({
      token: jwtHelper.generateJwt({ username }),
    });
  }

  return response.status(401).json({ message: "Invalid credentials" });
});

function checkToken(request, response, done) {
  const token =
    request.headers["authorization"] || request.headers["Authorization"];

  if (!tokenHelper.validateToken(token)) {
    response.status(401).json({ message: "Invalid token" });
  }

  done();
}

function checkJwtToken(request, response, done) {
  const token =
    request.headers["authorization"] || request.headers["Authorization"];

  const decodedJwt = jwtHelper.validateJwt(token);

  if (!decodedJwt) {
    response.status(401).json({ message: "Invalid token" });
  }

  request.user = decodedJwt;

  done();
}

module.exports = app;