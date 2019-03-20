const express = require('express');
const router = express.Router();

let books = require('../booklist');
// console.log(books);

const Book = require('../models/books');

const verifyToken = (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) res.sendStatus(403);
  else {
    if (authorization === 'Bearer my-bearer-token') next();
    else res.sendStatus(403);
  }
};

router
  .route('/')
  .get(async (req, res) => {
    const keys = Object.keys(req.query);
    const filterExpressions = keys.map(key => ({
      [key]: new RegExp(req.query[key], 'i'),
    }));
    if (keys.length === 0) {
      return res.json(await Book.find({}));
    } else {
      Book.find()
        .or(filterExpressions)
        .then(books => res.json(books))
        .catch(err => res.status(500).end());
    }
  })
  .post(verifyToken, (req, res) => {
    const book = new Book(req.body);
    book.save((err, book) => {
      if (err) res.status(500).end();
      res.status(201).json(book);
    });
  });

router
  .route('/:id')
  .get((req, res) => {
    Book.findById(req.params.id)
      .then(book => res.status(200).json(book))
      .catch(err => res.status(404).send('Book not found.'));
  })
  .put(verifyToken, (req, res) => {
    Book.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true },
      (err, book) => {
        return res.status(202).json(book);
      }
    );
  })
  .delete(verifyToken, (req, res) => {
    Book.findByIdAndDelete(req.params.id, (err, book) => {
      if (err) return res.sendStatus(500);

      if (!book) return res.sendStatus(404);

      return res.status(202).json(book);
    });
  });

module.exports = router;
