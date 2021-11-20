const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const config = require("./config");

// require routes
const addComment = require("./api/routes/add");
const getComment = require("./api/routes/get");

const app = express();
app.locals.moment = require("moment");

require("./config/db");

app.set("view engine", "pug");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "./public")));

// use routes
app.use("/add", addComment);
app.use("/get", getComment);

app.get("/", function (req, res) {
  res.render(path.join(__dirname, "/views/pages/index"), {
    title: "Geo Reviews",
  });
});

function normalizePort(val) {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

const port = normalizePort(process.env.PORT || "3000");

app.listen(port, () => console.log(`Running on port: ${config.API_PORT}`));
