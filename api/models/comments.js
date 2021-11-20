const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  coords: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    lowercase: true,
  },
  name: String,
  place: String,
  text: String,
  date: Date,
});

module.exports = mongoose.model("CommentsOnPlace", schema);
