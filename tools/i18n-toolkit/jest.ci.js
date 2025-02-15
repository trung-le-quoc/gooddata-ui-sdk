// (C) 2019 GoodData Corporation
const ciBase = require("../../common/config/jest/jest.config.ci.base.js");

module.exports = {
    ...ciBase,
    testPathIgnorePatterns: ["/node_modules/", "/dist/"],
    setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
};
