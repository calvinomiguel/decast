const EventEmitter = require("events");
const process = require("../index");

test("should be an instance of EventEmitter", () => {
  expect(process instanceof EventEmitter).toBe(true);
});

test("process.title should be an string", () => {
  expect(process.title).toBe("plugin-tests");
});

test("process.version should be an version string", () => {
  expect(process.version).toBe("0.1.0");
});

test("process.versions should be an object", () => {
  expect(typeof process.versions.sketch).toBe("string");
});

test("process.arch should be an version string", () => {
  expect(process.arch).toBe("x64");
});

test("process.platform should be an version string", () => {
  expect(process.platform).toBe("darwin");
});

test("process.cwd should be a function", () => {
  expect(process.cwd).toBe("object");
});

test("process.env should be an object", () => {
  expect(typeof process.env).toBe("object");
});

test("process.execPath should be a string", () => {
  expect(typeof process.execPath).toBe("string");
});

test("process.type should be a string", () => {
  expect(process.type).toBe("sketch");
});

test("process.nextTick should be a function", () => {
  expect(typeof process.nextTick).toBe("function");
});
