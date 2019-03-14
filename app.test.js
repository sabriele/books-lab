const request = require("supertest");
const app = require("./app");

describe("App", () => {
  test("should display 'hi' on main page", () => {
    return request(app)
      .get("/")
      .expect("hi")
      .expect(200);
  });
});
