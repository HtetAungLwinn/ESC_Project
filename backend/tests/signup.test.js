const httpMocks = require('node-mocks-http');
const { signupHandler } = require('../routes/signup');
// const express = require("express");
const db = require("../models/database");
const bcrypt = require("bcrypt");

jest.mock("../models/database");

describe("POST /api/signup", () => {
  const user = {
    uid: "uid_abc123",
    firstName: "Alice",
    lastName: "Smith",
    salutation: "Mr.",
    religion: "Buddhism",
    phoneNumber: "98765432",
    address: "Bedok",
    postalCode: "123456",    
    email: "alice@example.com",
    password: "secure123",
    roles: "1",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("returns 200 and successful insert", async () => {
    db.execute.mockResolvedValueOnce();

    const req = httpMocks.createRequest({ method: 'POST', body: user });
    const res = httpMocks.createResponse();

    await signupHandler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toEqual({ success: true });
  });

  test("returns 409 if user already exists (duplicate)", async () => {
    const dupErr = new Error("Duplicate entry");
    dupErr.code = "ER_DUP_ENTRY";
    db.execute.mockRejectedValueOnce(dupErr);

    const req = httpMocks.createRequest({ method: 'POST', body: user });
    const res = httpMocks.createResponse();

    await signupHandler(req, res);

    expect(res.statusCode).toBe(409);
    expect(res._getJSONData()).toEqual({ success: false, error: 'User already exists' });
  });

  test("returns 500 on unexpected DB error", async () => {
    db.execute.mockRejectedValueOnce(new Error("Database crashed"));

    const req = httpMocks.createRequest({ method: 'POST', body: user });
    const res = httpMocks.createResponse();

    await signupHandler(req, res);

    expect(res.statusCode).toBe(500);
    expect(res._getJSONData().error).toBe('Database crashed');
  });
});
