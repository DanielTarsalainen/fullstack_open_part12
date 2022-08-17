const express = require("express");
const { Todo } = require("../mongo");
const router = express.Router();
const { setAsync, getAsync } = require("../redis/index");

/* GET todos listing. */
router.get("/", async (_, res) => {
  const todos = await Todo.find({});
  setAsync("added_todos", todos.length);
  res.send(todos);
});

/* POST todo to listing. */
router.post("/", async (req, res) => {
  const todo = await Todo.create({
    text: req.body.text,
    done: false,
  });
  res.send(todo);
  let val = await getAsync("added_todos");

  if (val) {
    val = parseInt(val);
    setAsync("added_todos", (val += 1));
  } else {
    const todos = await Todo.find({});
    setAsync("added_todos", todos.length);
  }
});

const singleRouter = express.Router();

const findByIdMiddleware = async (req, res, next) => {
  const { id } = req.params;
  req.todo = await Todo.findById(id);

  if (!req.todo) return res.sendStatus(404);

  next();
};

/* DELETE todo. */
singleRouter.delete("/", async (req, res) => {
  const todo = req.todo;

  await todo.remove();

  res.sendStatus(200);
});

/* GET todo. */
singleRouter.get("/", async (req, res) => {
  const todo = await req.todo;

  res.send(todo);
});

/* PUT todo. */
singleRouter.put("/", async (req, res) => {
  req.todo.done = true;

  await req.todo.updateOne(req.todo);

  res.sendStatus(200);
});

router.use("/:id", findByIdMiddleware, singleRouter);

module.exports = router;
