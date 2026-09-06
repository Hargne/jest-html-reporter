import { AggregatedResult } from "@jest/test-result";
import {
  ConsoleLogEntry,
  JestGlobalConfig,
  JestHTMLReporterConfiguration,
  JestHTMLReporterResult,
  JestReporterContext,
} from "./types";
import generateReport from "./generateReport";

export default function JestHTMLReporter(
  jest: JestReporterContext,
  globalConfig: JestGlobalConfig,
  options: Partial<JestHTMLReporterConfiguration>,
): JestHTMLReporterResult {
  /**
   * If the reporter is run as a 'testResultsProcessor', we must return the test results as they were received from Jest
   * https://facebook.github.io/jest/docs/en/configuration.html#testresultsprocessor-string
   */
  if (isRunAsTestResultsProcessor(globalConfig)) {
    generateReport({
      testData: globalConfig,
      options,
    });
    return globalConfig;
  }

  // Capture console logs for each test result
  // Note: TestResult will only contain console logs if Jest is run with verbose=false
  const capturedConsoleLogs: ConsoleLogEntry[] = [];
  jest.onTestResult = (_unusedTest, result) => {
    if (!result.console) return;

    capturedConsoleLogs.push({
      filePath: result.testFilePath,
      logs: result.console,
    });
  };

  jest.onRunComplete = (_unusedContexts, testData) => {
    return generateReport({
      testData,
      options,
      jestConfig: globalConfig,
      consoleLogs: capturedConsoleLogs,
    });
  };
}

function isRunAsTestResultsProcessor(
  value: JestGlobalConfig,
): value is AggregatedResult {
  return "testResults" in value && Array.isArray(value.testResults);
}
