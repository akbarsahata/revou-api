require("dotenv").config();

const db = require("./database");
const Task = require("./database/task");
const { taskModel, tokenHelper, jwtHelper } = require("./util");

const fastify = require("fastify")({ logger: true });

fastify.register(require("@fastify/cors"));

fastify.route({
  method: "GET",
  url: "/tasks",
  handler: function (request, response) {
    const tasks = taskModel.getTasks();

    return {
      data: tasks,
      count: tasks.length,
    };
  },
});

fastify.route({
  method: "GET",
  url: "/v2/tasks",
  handler: async function (request, response) {
    const tasks = await Task.findAll();
    const taskCount = await Task.count();

    return {
      data: tasks,
      count: taskCount,
    };
  },
});

fastify.route({
  method: "GET",
  url: "/tasks/:id",
  handler: function (request, response) {
    if (!Number(request.params.id)) {
      return response.status(400).send({ message: "Invalid ID" });
    }

    const id = Number(request.params.id);

    const task = taskModel.getTask(id);

    if (!task) {
      return response.status(404).send({ message: "Task not found" });
    }

    return {
      data: task,
    };
  },
});

fastify.route({
  method: "GET",
  url: "/v2/tasks/:id",
  handler: async function (request, response) {
    const task = await Task.findByPk(request.params.id);

    if (!task) {
      return response.status(404).send({ message: "Task not found" });
    }

    return {
      data: task,
    };
  },
});

fastify.route({
  method: "POST",
  url: "/tasks",
  handler: function (request, response) {
    const description = request.body.description;

    if (!description) {
      response.status(400).send({ message: "Description is required" });
    }

    const task = taskModel.createTask(description);

    response.status(201).send({
      data: task,
    });
  },
});

fastify.route({
  method: "POST",
  url: "/v2/tasks",
  handler: async function (request, response) {
    const description = request.body.description;

    if (!description) {
      response.status(400).send({ message: "Description is required" });
    }

    const task = await Task.create({ description });

    const newTask = await task.save();

    response.status(201).send({
      data: newTask,
    });
  },
});

fastify.route({
  method: "PUT",
  url: "/tasks/:id",
  handler: function (request, response) {
    const id = Number(request.params.id);
    const description = request.body.description;
    const isDone = request.body.isDone;

    const task = taskModel.updateTask(id, description, isDone);

    if (!task) {
      return response.status(404).send({ message: "Task not found" });
    }

    return response.status(200).send({
      data: task,
    });
  },
});

fastify.route({
  method: "PUT",
  url: "/v2/tasks/:id",
  handler: async function (request, response) {
    const description = request.body.description;
    const isDone = request.body.isDone;

    const task = await Task.findByPk(request.params.id);

    if (!task) {
      return response.status(404).send({ message: "Task not found" });
    }

    task.description = description || task.description;

    if (isDone !== undefined) {
      task.isDone = isDone;
    }

    const updatedTask = await task.save();

    return response.status(200).send({
      data: updatedTask,
    });
  },
});

fastify.route({
  method: "DELETE",
  url: "/tasks/:id",
  handler: function (request, response) {
    const id = Number(request.params.id);

    taskModel.deleteTask(id);

    response.status(204).send();
  },
});

fastify.route({
  method: "DELETE",
  url: "/v2/tasks/:id",
  handler: async function (request, response) {
    const task = await Task.findByPk(request.params.id);

    if (!task) {
      return response.status(404).send({ message: "Task not found" });
    }

    await Task.destroy({ where: { id: request.params.id } });

    response.status(204).send();
  },
});

fastify.route({
  method: "GET",
  url: "/",
  handler: function (request, response) {
    return { message: "Welcome to the Task API" };
  },
});

fastify.route({
  method: "POST",
  url: "/login",
  handler: function (request, response) {
    const { username, password } = request.body;

    if (
      username === process.env.USERNAME &&
      password === process.env.PASSWORD
    ) {
      response.status(201).send({
        token: tokenHelper.generateToken(),
      });
    }

    response.status(401).send({ message: "Invalid credentials" });
  },
});

fastify.route({
  method: "POST",
  url: "/v2/login",
  handler: function (request, response) {
    const { username, password } = request.body;

    if (
      username === process.env.USERNAME &&
      password === process.env.PASSWORD
    ) {
      return response.status(201).send({
        token: jwtHelper.generateJwt({ username }),
      });
    }

    return response.status(401).send({ message: "Invalid credentials" });
  },
});

fastify.setNotFoundHandler(function (request, response) {
  response.status(404).send({ message: "Route not found" });
});

fastify.setErrorHandler(function (error, request, response) {
  response.status(500).send({ message: error.message });
});

function checkToken(request, response, done) {
  const token =
    request.headers["authorization"] || request.headers["Authorization"];

  if (!tokenHelper.validateToken(token)) {
    response.status(401).send({ message: "Invalid token" });
  }

  done();
}

function checkJwtToken(request, response, done) {
  const token =
    request.headers["authorization"] || request.headers["Authorization"];

  console.log(token);

  const decodedJwt = jwtHelper.validateJwt(token);

  if (!decodedJwt) {
    response.status(401).send({ message: "Invalid token" });
  }

  request.user = decodedJwt;

  done();
}

async function start() {
  try {
    fastify.decorateRequest("user", null);
    await db.authenticate();
    console.log("Database connected");
    await fastify.listen({ port: 3000, host: "0.0.0.0" });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

start().then(() => {
  console.log("Server is running on port 3000");
});
