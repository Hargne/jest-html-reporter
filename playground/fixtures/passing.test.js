describe("Calculator", () => {
  describe("addition", () => {
    test("adds two positive numbers", () => {
      expect(1 + 2).toBe(3);
    });

    test("adds a very long and descriptive test title so we can check how the report wraps or truncates lengthy text without breaking the layout or losing information for screen reader users", () => {
      expect(2 + 2).toBe(4);
    });
  });

  describe("unicode & emoji handling 🧮", () => {
    test("supports non-latin titles — 数学 テスト ✅", () => {
      expect(true).toBe(true);
    });
  });
});
