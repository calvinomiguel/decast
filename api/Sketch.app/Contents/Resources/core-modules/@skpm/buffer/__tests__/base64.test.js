var B = require("../").Buffer;

test("base64: ignore whitespace", function() {
  var text = "\n   YW9ldQ==  ";
  var buf = new B(text, "base64");
  expect(buf.toString()).toBe("aoeu");
});

test("base64: strings without padding", function() {
  expect(new B("YW9ldQ", "base64").toString()).toBe("aoeu");
});

test("base64: newline in utf8 -- should not be an issue", function() {
  expect(
    new B(
      "LS0tCnRpdGxlOiBUaHJlZSBkYXNoZXMgbWFya3MgdGhlIHNwb3QKdGFnczoK",
      "base64"
    ).toString("utf8")
  ).toBe("---\ntitle: Three dashes marks the spot\ntags:\n");
});

test("base64: newline in base64 -- should get stripped", function() {
  expect(
    new B(
      "LS0tCnRpdGxlOiBUaHJlZSBkYXNoZXMgbWFya3MgdGhlIHNwb3QKdGFnczoK\nICAtIHlhbWwKICAtIGZyb250LW1hdHRlcgogIC0gZGFzaGVzCmV4cGFuZWQt",
      "base64"
    ).toString("utf8")
  ).toBe(
    "---\ntitle: Three dashes marks the spot\ntags:\n  - yaml\n  - front-matter\n  - dashes\nexpaned-"
  );
});

test("base64: tab characters in base64 - should get stripped", function() {
  expect(
    new B(
      "LS0tCnRpdGxlOiBUaHJlZSBkYXNoZXMgbWFya3MgdGhlIHNwb3QKdGFnczoK\t\t\t\tICAtIHlhbWwKICAtIGZyb250LW1hdHRlcgogIC0gZGFzaGVzCmV4cGFuZWQt",
      "base64"
    ).toString("utf8")
  ).toBe(
    "---\ntitle: Three dashes marks the spot\ntags:\n  - yaml\n  - front-matter\n  - dashes\nexpaned-"
  );
});

test("base64: invalid non-alphanumeric characters -- should be stripped", function() {
  expect(
    new B("!\"#$%&'()*,.:;<=>?@[\\]^`{|}~", "base64").toString("utf8")
  ).toBe("");
});

test("base64: high byte", function() {
  var highByte = B.from([128]);
  expect(B.alloc(1, highByte.toString("base64"), "base64")).toEqual(highByte);
});
