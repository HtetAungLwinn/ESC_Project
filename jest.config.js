module.exports = {
  testEnvironment: "jsdom",
  transformIgnorePatterns: [
    "/node_modules/(?!react-leaflet|@react-leaflet|leaflet)"
  ],
  transform: {
    "^.+\\.[jt]sx?$": "babel-jest",
  },
  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
    "\\.(jpg|jpeg|png|gif|svg)$": "<rootDir>/__mocks__/fileMock.js"
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
};
