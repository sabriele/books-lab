const request = require("supertest");
const app = require("../../app");

const books = require("../../booklist");
const route = "/books";

describe("Books", () => {
  test("should forbid access for no authorization", () => {
    return request(app)
      .post(route)
      .send({ author: "Hans Christian Andersen" })
      .ok(res => res.status === 403)
      .then(res => {
        expect(res.status).toBe(403);
      });
  });

  test("should deny access with incorrect authorization token", () => {
    return request(app)
      .post(route)
      .set("Authorization", "Bearer some-invalid-token")
      .send({ author: "Hans Christian Andersen" })
      .ok(res => res.status === 403)
      .then(res => {
        expect(res.status).toBe(403);
      });
  });

  test("should grant access with authorization ", () => {
    return request(app)
      .post(route)
      .set("Authorization", "Bearer my-bearer-token")
      .send({ id: "123", author: "Hans Christian Andersen" })
      .expect(201)
      .then(res => {
        expect(res.body).toEqual({
          id: expect.any(String),
          author: "Hans Christian Andersen"
        });
      });
  });

  test("should correctly display message on books main route", () => {
    return request(app)
      .get(route)
      .expect(books)
      .expect(200);
  });

  test("should show correct book by query", () => {
    const queryField = "title";
    const query = "Fairy tales";
    return request(app)
      .get(`${route}`)
      .query({ [queryField]: `${query}` })
      .expect(books.filter(book => book.title === "Fairy tales"))
      .expect(200);
  });

  test("should post all books", () => {
    return request(app)
      .post(route)
      .set("Authorization", "Bearer my-bearer-token")
      .send({ author: "Hans Christian Andersen" })
      .set("Content-Type", "application/json")
      .expect({ id: "123", author: "Hans Christian Andersen" })
      .expect(201)
      .then(res => {
        expect(res.body).toEqual(expect.any(Object));
        expect(res.body).toEqual({
          id: expect.any(String),
          author: "Hans Christian Andersen"
        });
      });
  });

  test("should update a book entry", () => {
    return request(app)
      .put(`${route}/123`)
      .set("Authorization", "Bearer my-bearer-token")
      .send({ author: "Hans C. Andersen" })
      .expect({ author: "Hans C. Andersen" })
      .expect(202);
  });

  test("should update only the selected fields of a book entry", () => {
    return request(app)
      .patch(`${route}/123`)
      .set("Authorization", "Bearer my-bearer-token")
      .send({ author: "H. C. Andersen" })
      .expect({ author: "H. C. Andersen" })
      .expect(202);
  });

  test("should delete a book entry", () => {
    const id = "5c8b1062e2199d13c1c87746";
    return request(app)
      .delete(`${route}/${id}`)
      .set("Authorization", "Bearer my-bearer-token")
      .expect(202);
  });

  test("should fail when there is no such book to delete", done => {
    const id = "100";
    request(app)
      .delete(`${route}/${id}`)
      .set("Authorization", "Bearer my-bearer-token")
      .expect(400, done);
  });
});
