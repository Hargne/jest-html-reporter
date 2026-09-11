describe("Feature flags", () => {
  test.skip("skipped: legacy checkout flow", () => {
    expect(true).toBe(false);
  });

  test.todo("todo: implement dark mode toggle test");

  // eslint-disable-next-line jest/no-disabled-tests
  xit("disabled via xit", () => {
    expect(true).toBe(true);
  });
});
