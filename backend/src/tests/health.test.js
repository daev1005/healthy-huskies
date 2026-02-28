const request = require("supertest");
const app = require("../app");

describe("App smoke test", () => {
  test("GET /api/hello returns backend message", async () => {
    const res = await request(app).get("/api/hello");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: "Hello from backend!" });
  });
});
