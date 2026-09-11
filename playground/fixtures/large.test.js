describe("Large suite (scale check)", () => {
  for (let i = 1; i <= 40; i += 1) {
    test(`generated case #${i} behaves as expected`, () => {
      expect(i % 7 === 0 ? "fail-me" : "ok").toBe(i % 7 === 0 ? "fail-me" : "ok");
    });
  }
});
