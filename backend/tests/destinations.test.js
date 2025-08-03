const { getAllDestinations, getUidByDestinationTerm } = require("../models/destinations");

// Mock db
jest.mock("../models/database", () => ({
  query: jest.fn()
}));
const db = require("../models/database");

describe("models/destinations.js", () => {
  let req, res;
  beforeEach(() => {
    req = { query: {} };  //initialize req with an empty query object
    // Mock response object
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    db.query.mockReset();
    // Reset cache for getAllDestinations
    const mod = require("../models/destinations");
    mod.__test.clearCache();
  });

  describe("getAllDestinations", () => {
    it("returns destinations from db and caches them", async () => {
      // mocks one successful db query
      db.query.mockResolvedValueOnce([[{ term: "Singapore" }, { term: "Tokyo" }]]);
      await getAllDestinations(req, res);
      expect(db.query).toHaveBeenCalledWith("SELECT term FROM destinations");
      expect(res.json).toHaveBeenCalledWith(["Singapore", "Tokyo"]);
    });

    it("returns cached destinations if already fetched", async () => {
      db.query.mockResolvedValueOnce([[{ term: "Singapore" }, { term: "Tokyo" }]]);
      await getAllDestinations(req, res); // first call, fills cache
      res.json.mockClear();
      db.query.mockClear();
      await getAllDestinations(req, res); // second call, uses cache
      expect(db.query).not.toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(["Singapore", "Tokyo"]);
    });

    it("handles db error", async () => {
      // Clear the cache to force DB access
      const mod = require("../models/destinations");
      if (mod.cachedDestinations) mod.cachedDestinations.length = 0;
      db.query.mockRejectedValueOnce(new Error("fail"));
      await getAllDestinations(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: expect.any(String) });
    });
  });

  describe("getUidByDestinationTerm", () => {
    it("returns 400 if term is missing", async () => {
      req.query.term = " ";
      await getUidByDestinationTerm(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: expect.any(String) });
    });

    it("returns 404 if no destination found", async () => {
      req.query.term = "Bangkok";
      db.query.mockResolvedValueOnce([[]]);
      await getUidByDestinationTerm(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: expect.any(String) });
    });

    it("returns uid and term if found", async () => {
      req.query.term = "Singapore";
      db.query.mockResolvedValueOnce([[{ uid: "abc123", term: "Singapore" }]]);
      await getUidByDestinationTerm(req, res);
      expect(res.json).toHaveBeenCalledWith({ uid: "abc123", term: "Singapore" });
    });

    it("handles db error", async () => {
      req.query.term = "Singapore";
      db.query.mockRejectedValueOnce(new Error("fail"));
      await getUidByDestinationTerm(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: expect.any(String) });
    });
  });
});

// reset cache in test 
const mod = require("../models/destinations");
mod.__setCachedDestinations = arr => { mod.cachedDestinations = arr; };
