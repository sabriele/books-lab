const request = require("supertest");
const app = require("../../app");

describe("Books", () => {
  test("should correctly display message on books main route", () => {
    return request(app)
      .get("/books")
      .expect("This is the books route")
      .expect(200);
  });
});
