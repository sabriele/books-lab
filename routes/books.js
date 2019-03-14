const express = require("express");
const router = express.Router();

const books = require("../booklist");

const verifyToken = (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) {
    res.sendStatus(403);
  } else {
    if (authorization === "Bearer my-bearer-token") {
      next();
    } else {
      res.sendStatus(403);
    }
  }
};

router
  .route("/")
  .get((req, res) => {
    res.json(books);
  })
  .post(verifyToken, (req, res) => {
    const book = req.body;
    book.id = "123";
    res.status(201).json(book);
  });

router
  .route("/:id")
  .put(verifyToken, (req, res) => {
    res.status(202).json(req.body);
  })
  .patch(verifyToken, (req, res) => {
    res.status(202).json(req.body);
  })
  .delete(verifyToken, (req, res) => {
    res.status(202).json();
  });

module.exports = router;
