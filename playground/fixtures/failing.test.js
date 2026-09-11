describe("Payment processing", () => {
  test("rejects a negative amount", () => {
    expect(-5).toBeGreaterThan(0);
  });

  test("throws a custom error with a multi-line message", () => {
    throw new Error(
      "Payment gateway timed out\nRequest ID: 8f3c-91ab\nRetrying is not recommended",
    );
  });

  test("resolves an async assertion failure", async () => {
    await new Promise((resolve) => setTimeout(resolve, 5));
    expect(await Promise.resolve(42)).toBe(43);
  });
});
