const express = require("express");
const router = express.Router();
const configs = require("../util/config");
const { Todo } = require("../mongo");
const { getAsync, setAsync } = require("../redis/index");

let visits = 0;

/* GET index data. */
router.get("/", async (req, res) => {
  visits++;

  res.send({
    ...configs,
    visits,
  });
});

router.get("/statistics", async (req, res) => {
  const stats = await getAsync("added_todos");

  if (stats) {
    const statsObject = { added_todos: stats };
    res.send(statsObject);
  } else {
    res.send({ addedTodos: 0 });
  }
});

module.exports = router;
