const request = require("supertest");
const app = require("../app");

describe("App", () => {
  test("should correctly display welcome message on main page", () => {
    return request(app)
      .get("/")
      .expect("Welcome to The Bookstore")
      .expect(200);
  });
});
