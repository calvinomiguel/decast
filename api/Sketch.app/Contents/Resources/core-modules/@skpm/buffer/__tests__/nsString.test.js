const { Buffer } = require("../");

const nsString = NSString.stringWithString("hello");

test("should get a Buffer from an NSString", () => {
  expect(Buffer.from(nsString).length).toBe(nsString.length());
});

test("should return a string", () => {
  const buffer = Buffer.from(nsString);
  const string = buffer.toString();
  expect(string).toBe(String(nsString));
});
