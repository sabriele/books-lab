const express = require("express");
const app = express();
const books = require("./routes/books");

app.use(express.static("public"));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Welcome to The Bookstore");
});

app.use("/books", books);

module.exports = app;
