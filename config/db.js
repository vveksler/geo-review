const mongoose = require("mongoose");
const config = require("../config");

mongoose.Promise = global.Promise;

mongoose
  .connect(
    `mongodb+srv://${config.db.name}:${config.db.password}@cluster0.sdoe7.mongodb.net/${config.db.project}`
  )
  .catch((e) => {
    console.error(e);
    throw e;
  });

mongoose.connection.on("connected", function () {
  console.log(
    'Mongoose default connection open'
  );
});

// If the connection throws an error
mongoose.connection.on("error", function (err) {
  console.log("Mongoose default connection error: " + err);
});

// When the connection is disconnected
mongoose.connection.on("disconnected", function () {
  console.log("Mongoose default connection disconnected");
});

// If the Node process ends, close the Mongoose connection
process.on("SIGINT", function () {
  mongoose.connection.close(function () {
    console.log(
      "Mongoose default connection disconnected through app termination"
    );
    process.exit(0);
  });
});
