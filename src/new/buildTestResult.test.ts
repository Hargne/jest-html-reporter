import {
  mockFailedTestResult,
  mockPassedTestResult,
  mockPendingTestResult,
} from "../__mock__/testResults.mock";
import buildTestResult from "./buildTestResult";

describe("buildTestResult", () => {
  it("should render passed test results", () => {
    const testResult = buildTestResult(mockPassedTestResult).toString();

    expect(testResult).toContain('<div class="test-result passed">');
    expect(testResult).toContain('<div class="test-suitename">ancestor</div>');
    expect(testResult).toContain('<div class="test-title">title</div>');
    expect(testResult).toContain('<div class="test-status">passed</div>');
    expect(testResult).toContain('<div class="test-duration">0.001s</div>');
  });

  it("should render failed test results", () => {
    const testResult = buildTestResult(mockFailedTestResult).toString();

    expect(testResult).toContain('<div class="test-result failed">');
    expect(testResult).toContain(
      '<div class="test-suitename">ancestor1 &gt; ancestor2</div>',
    );
    expect(testResult).toContain('<div class="test-title">title</div>');
    expect(testResult).toContain('<div class="test-status">failed</div>');
    expect(testResult).toContain('<div class="test-duration">0.002s</div>');
  });

  it("should render pending test results", () => {
    const testResult = buildTestResult(mockPendingTestResult).toString();

    expect(testResult).toContain('<div class="test-result pending">');
    expect(testResult).toContain('<div class="test-suitename">ancestor</div>');
    expect(testResult).toContain('<div class="test-title">title</div>');
    expect(testResult).toContain('<div class="test-status">pending</div>');
    expect(testResult).toContain('<div class="test-duration">0.003s</div>');
  });

  it("should render failure messages if configured", () => {
    const testResult = buildTestResult(mockFailedTestResult, true).toString();

    expect(testResult).toContain('<div class="failureMessages">');
  });

  it("should not render failure messages if it isn't configured", () => {
    const testResult = buildTestResult(mockFailedTestResult).toString();

    expect(testResult).not.toContain('<div class="failureMessages">');
  });

  it("should not render failure messages if there are none", () => {
    const testResult = buildTestResult(mockPassedTestResult).toString();

    expect(testResult).not.toContain('<div class="failureMessages">');
  });
});
