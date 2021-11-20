const express = require("express");
const CommentsOnPlace = require("../models/comments");

const router = express.Router();

router.post("/", (req, res) => {
  console.log("Comment:", req.body);

  const { address, coords, name, place, text } = req.body;

  CommentsOnPlace.create(
    {
      coords,
      address,
      name,
      place,
      text,
      date: new Date().toISOString(),
    },
    (err, comm) => {
      if (err) {
        console.log("Error", err);
      }
      res.send(comm);
    }
  );
});

module.exports = router;
