const express = require("express");
const app = express();
const books = require("./routes/books");

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.send("Welcome to The Bookstore");
});

app.use("/books", books);

module.exports = app;
