/**
 * This is only template tests used for testing the 
 * implementation jest-html-reporter together with Jest
 */

const { add, subtract } = require("./index");

describe("test-project", () => {
  test("adds 1 + 2 to equal 3", () => {
    expect(add(1, 2)).toBe(3);
  });
  
  test("subtracts 5 - 3 to equal 2", () => {
    expect(subtract(5, 3)).toBe(2);
  });
})

