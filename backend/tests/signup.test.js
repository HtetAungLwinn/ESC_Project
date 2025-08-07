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

  test("returns 400 if required fields are missing", async () => {
    const incompleteUser = { ...user };
    delete incompleteUser.uid;

    const req = httpMocks.createRequest({ method: 'POST', body: incompleteUser });
    const res = httpMocks.createResponse();

    await signupHandler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res._getJSONData().error).toMatch(/missing/i);
  });

  test("returns 405 for unsupported methods", async () => {
    const req = httpMocks.createRequest({ method: 'GET' });
    const res = httpMocks.createResponse();

    await signupHandler(req, res);

    expect(res.statusCode).toBe(405);
  });

  test("returns 500 if bcrypt.hash fails", async () => {
    jest.spyOn(bcrypt, 'hash').mockRejectedValueOnce(new Error("Hashing failed"));

    const req = httpMocks.createRequest({ method: 'POST', body: user });
    const res = httpMocks.createResponse();

    await signupHandler(req, res);

    expect(res.statusCode).toBe(500);
    expect(res._getJSONData().error).toBe("Hashing failed");
  });

  test("returns 400 if request body is missing", async () => {
    const req = httpMocks.createRequest({ method: 'POST' }); // no body
    const res = httpMocks.createResponse();

    await signupHandler(req, res);

    expect(res.statusCode).toBe(400);
  });

  test("returns 400 if required fields are empty strings", async () => {
    const req = httpMocks.createRequest({
      method: 'POST',
      body: {
        uid: "",
        firstName: "",
        lastName: "",
        salutation: "",
        religion: "",
        phoneNumber: "",
        address: "",
        postalCode: "",    
        email: "",
        password: "",
        roles: "1",
      },
    });
    const res = httpMocks.createResponse();

    await signupHandler(req, res);

    expect(res.statusCode).toBe(400);
  });

  test("calls db.execute with correct query and parameters", async () => {
    db.execute.mockResolvedValueOnce();

    const req = httpMocks.createRequest({ method: 'POST', body: user });
    const res = httpMocks.createResponse();

    await signupHandler(req, res);

    expect(db.execute).toHaveBeenCalledWith(
      expect.stringContaining("INSERT INTO User"),
      [
        user.uid,
        user.firstName,
        user.lastName,
        user.salutation,
        user.religion,
        user.phoneNumber,
        user.address,
        user.postalCode,
        user.email,
        expect.any(String), // hashed password
        user.roles
      ]
    );
  });

  test("calls bcrypt.hash with the provided password", async () => {
    const spy = jest.spyOn(bcrypt, 'hash').mockResolvedValueOnce("hashed_pw");

    const req = httpMocks.createRequest({ method: 'POST', body: user });
    const res = httpMocks.createResponse();

    await signupHandler(req, res);

    expect(spy).toHaveBeenCalledWith(user.password, 10);
  });  
});