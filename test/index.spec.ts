import JestHTMLReporter from "../src";
import {
  mockedFullReportOutput,
  mockedJestGlobalConfig,
  mockedJestResponseSingleTestResult
} from "./mockdata";

describe("index", () => {
  beforeEach(() => {
    // Reset the mocked modules prior to each test case
    jest.resetModules();
  });

  it("should return the jest global config if used as a testResultsProcessor", () => {
    const input = {
      ...mockedJestGlobalConfig,
      testResults: mockedJestResponseSingleTestResult
    };

    // Trigger the reporter as a testResultsProcessor
    // @ts-ignore
    const testResultsProcessorOutput = JestHTMLReporter(input, {});
    expect(testResultsProcessorOutput).toEqual(input);
  });
});
