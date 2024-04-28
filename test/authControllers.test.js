import mongoose from "mongoose";
import request from "supertest";
import { app } from "../app.js";

const { DB_HOST, PORT = 3000 } = process.env;

describe("POST /api/users/login", () => {
  let server = null;

  beforeAll(async () => {
    await mongoose.connect(DB_HOST);
    server = app.listen(PORT);
  });

  afterAll(async () => {
    await mongoose.connection.close();
    server.close();
  });

  test("should return user and token after login", async () => {
    const loginData = {
      email: "test@gmail.com",
      password: "123456",
    };

    const { statusCode, body } = await request(app)
      .post("/api/users/login")
      .send(loginData);

    expect(statusCode).toBe(200);
    expect(body).toHaveProperty("token");
    expect(typeof body.token).toBe("string");
    expect(body.user).toHaveProperty("email");
    expect(typeof body.user.email).toBe("string");
    expect(body.user).toHaveProperty("subscription");
    expect(typeof body.user.subscription).toBe("string");
  });
});
