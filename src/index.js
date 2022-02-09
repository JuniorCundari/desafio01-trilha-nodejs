const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function verifyExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  if (!user) {
    return response.status(404).json({ error: "User does not exists!" });
  }

  request.user = user;

  return next();
}

app.post("/users", (request, response) => {
  const { username, name } = request.body;

  const userAlreadyExists = users.find((user) => user.username == username);

  if (userAlreadyExists) {
    return response.status(400).json({ error: "User already exists" });
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };

  users.push(user);

  return response.status(201).json(user);
});

app.get("/todos", verifyExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos);
});

app.post("/todos", verifyExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put("/todos/:id", verifyExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const { title, deadline } = request.body;

  const verifyTodo = user.todos.find((todo) => todo.id === id);

  if (!verifyTodo) {
    return response.status(404).json({ error: "Todo not found" });
  }

  verifyTodo.title = title;
  verifyTodo.deadline = new Date(deadline);

  return response.json(verifyTodo);
});

app.patch("/todos/:id/done", verifyExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const verifyTodo = user.todos.find((todo) => todo.id === id);

  if (!verifyTodo) {
    return response.status(404).json({ error: "Todo not found" });
  }

  verifyTodo.done = true;

  return response.json(verifyTodo);
});

app.delete("/todos/:id", verifyExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const indexTodo = user.todos.findIndex((todo) => todo.id === id);

  if (indexTodo === -1) {
    return response.status(404).json({ error: "Todo not found" });
  }

  user.todos.splice(indexTodo, 1);

  return response.status(204).send();
});

module.exports = app;

app.listen(3333);
