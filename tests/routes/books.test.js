const request = require('supertest');
const app = require('../../app');
const mongoose = require('mongoose');
const MongoMemoryServer = require('mongodb-memory-server').default;

const Book = require('../../models/books');
const books = require('../../booklist');
const route = '/books';

describe('Books', () => {
  let mongoServer;
  let db;

  beforeAll(async () => {
    jest.setTimeout(120000);
    mongoServer = new MongoMemoryServer();
    const mongoUri = await mongoServer.getConnectionString();

    await mongoose.connect(mongoUri, { useNewUrlParser: true });
    db = mongoose.connection;
  });

  beforeEach(async () => {
    await Book.insertMany([
      {
        id: '5c8b0fb39f93c68f55b84c2f',
        author: 'Chinua Achebe',
        country: 'Nigeria',
        imageLink: 'images/things-fall-apart.jpg',
        language: 'English',
        link: 'https://en.wikipedia.org/wiki/Things_Fall_Apart\n',
        pages: 209,
        title: 'Things Fall Apart',
        year: 1958,
      },
      {
        id: '5c8b0ff64b0205324ea104ec',
        author: 'Hans Christian Andersen',
        country: 'Denmark',
        imageLink: 'images/fairy-tales.jpg',
        language: 'Danish',
        link:
          'https://en.wikipedia.org/wiki/Fairy_Tales_Told_for_Children._First_Collection.\n',
        pages: 784,
        title: 'Fairy tales',
        year: 1836,
      },
    ]);
  });

  afterEach(async () => {
    await db.dropCollection('books');
  });

  afterAll(async () => {
    mongoose.disconnect();
    await mongoServer.stop();
  });

  describe('[GET]', () => {
    test('should correctly display message on books main route', () => {
      const expected = [
        {
          id: '5c8b0fb39f93c68f55b84c2f',
          author: 'Chinua Achebe',
          country: 'Nigeria',
          imageLink: 'images/things-fall-apart.jpg',
          language: 'English',
          link: 'https://en.wikipedia.org/wiki/Things_Fall_Apart\n',
          pages: 209,
          title: 'Things Fall Apart',
          year: 1958,
        },
        {
          id: '5c8b0ff64b0205324ea104ec',
          author: 'Hans Christian Andersen',
          country: 'Denmark',
          imageLink: 'images/fairy-tales.jpg',
          language: 'Danish',
          link:
            'https://en.wikipedia.org/wiki/Fairy_Tales_Told_for_Children._First_Collection.\n',
          pages: 784,
          title: 'Fairy tales',
          year: 1836,
        },
      ];
      return request(app)
        .get(route)
        .expect('Content-Type', /json/)
        .expect(200)
        .then(res => {
          const books = res.body;
          expect(books.length).toBe(2);
          books.forEach((book, index) => {
            expect(book.title).toBe(expected[index].title);
            expect(book.author).toBe(expected[index].author);
          });
        });
    });

    test('should get books by queries: title & author', () => {
      const expected = [
        expect.objectContaining({
          title: 'Things Fall Apart',
          author: 'Chinua Achebe',
        }),
        expect.objectContaining({
          title: 'Fairy tales',
          author: 'Hans Christian Andersen',
        }),
      ];
      return request(app)
        .get(route)
        .query({
          title: 'Things Fall Apart',
          author: 'Hans Christian Andersen',
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .then(res => {
          expect(res.body).toHaveLength(2);
          expect(res.body).toEqual(expect.arrayContaining(expected));
        });
    });

    test.only('should return a single book with matching ID ', () => {});
  });

  describe('[POST]', () => {
    test('should forbid access for no authorization', () => {
      return request(app)
        .post(route)
        .send({ author: 'Hans Christian Andersen' })
        .ok(res => res.status === 403)
        .then(res => {
          expect(res.status).toBe(403);
        });
    });

    test('should deny access with incorrect authorization token', () => {
      return request(app)
        .post(route)
        .set('Authorization', 'Bearer some-invalid-token')
        .send({ author: 'Hans Christian Andersen' })
        .ok(res => res.status === 403)
        .then(res => {
          expect(res.status).toBe(403);
        });
    });

    test('should grant access with authorization ', async () => {
      const res = await request(app)
        .post(route)
        .set('Authorization', 'Bearer my-bearer-token')
        .send({ title: "The Handmaid's Tale", author: 'Margaret Atwood' })
        .expect(201);

      expect(res.body.title).toBe("The Handmaid's Tale");
      expect(res.body.author).toBe('Margaret Atwood');

      const book = await Book.findOne({
        title: "The Handmaid's Tale",
        author: 'Margaret Atwood',
      });
      expect(book.title).toBe("The Handmaid's Tale");
      expect(book.author).toBe('Margaret Atwood');
    });

    test('should post a book', () => {
      return request(app)
        .post(route)
        .set('Authorization', 'Bearer my-bearer-token')
        .send({ title: "The Handmaid's Tale", author: 'Margaret Atwood' })
        .set('Content-Type', 'application/json')
        .expect(201)
        .then(res => {
          expect(res.body).toEqual(expect.any(Object));
          expect(res.body).toEqual(
            expect.objectContaining({
              title: "The Handmaid's Tale",
              author: 'Margaret Atwood',
            })
          );
        });
    });
  });

  describe('[PUT]', () => {
    test('should update a book entry', async () => {
      const { _id } = await Book.findOne({ title: 'Things Fall Apart' });
      const res = await request(app)
        .put(`${route}/${_id}`)
        .set('Authorization', 'Bearer my-bearer-token')
        .send({
          author: 'Hans Christian Andersen',
          country: 'Denmark',
          imageLink: 'images/fairy-tales.jpg',
          language: 'Danish',
          link:
            'https://en.wikipedia.org/wiki/Fairy_Tales_Told_for_Children._First_Collection.\n',
          pages: 784,
          title: 'Fairy tales',
          year: 1836,
        })
        .expect(202);

      expect(res.body).toEqual(
        expect.objectContaining({
          author: 'Hans Christian Andersen',
          country: 'Denmark',
          imageLink: 'images/fairy-tales.jpg',
          language: 'Danish',
          link:
            'https://en.wikipedia.org/wiki/Fairy_Tales_Told_for_Children._First_Collection.\n',
          pages: 784,
          title: 'Fairy tales',
          year: 1836,
        })
      );
    });
  });

  describe('[DELETE]', () => {
    test('should delete a book entry', async () => {
      const { _id } = await Book.findOne({ title: 'Things Fall Apart' });
      await request(app)
        .delete(`${route}/${_id}`)
        .set('Authorization', 'Bearer my-bearer-token')
        .expect(202);

      const book = await Book.findById(_id);
      expect(book).toBe(null);
    });

    test('should fail when there is no such book to delete', done => {
      const id = '5c8fb5c41529bf25dcba41a7';
      request(app)
        .delete(`${route}/${id}`)
        .set('Authorization', 'Bearer my-bearer-token')
        .expect(404, done);
    });
  });
});
