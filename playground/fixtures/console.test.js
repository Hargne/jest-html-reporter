describe("Logger output", () => {
  test("emits logs at every level", () => {
    console.log("plain log line");
    console.info("informational message");
    console.warn("careful: something looked off");
    console.error("something actually failed downstream");
    expect(true).toBe(true);
  });
});
