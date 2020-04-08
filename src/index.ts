import { AggregatedResult, TestResult } from "@jest/test-result";
import { Circus, Config } from "@jest/types";

import htmlreporter from "./htmlreporter";
import {
  IJestHTMLReporterConfigOptions,
  IJestHTMLReporterConsole,
} from "./types";

/**
 * Setup Jest HTML Reporter and generate a report with the given data
 */
const setupAndRun = (
  testResults: AggregatedResult,
  options: Config.DefaultOptions,
  jestConfig: Config.GlobalConfig,
  logs?: IJestHTMLReporterConsole[]
) => {
  const reporter = new htmlreporter(
    testResults,
    options as IJestHTMLReporterConfigOptions,
    jestConfig,
    logs
  );
  return reporter.generate();
};

/**
 * The test runner function passed to Jest
 */
function JestHtmlReporter(
  globalConfig: Config.GlobalConfig,
  options: Config.DefaultOptions
): Promise<Circus.TestResult> | Config.GlobalConfig {
  const consoleLogs: IJestHTMLReporterConsole[] = [];

  /**
   * If the first parameter has a property named 'testResults',
   * the script is being run as a 'testResultsProcessor'.
   * We then need to return the test results as they were received from Jest
   * https://facebook.github.io/jest/docs/en/configuration.html#testresultsprocessor-string
   */
  if (Object.prototype.hasOwnProperty.call(globalConfig, "testResults")) {
    // @ts-ignore
    setupAndRun(globalConfig.testResults, options, globalConfig);
    // Return the results as required by Jest
    return globalConfig;
  }

  /**
   * The default behaviour - run as Custom Reporter, in parallel with Jest.
   * https://facebook.github.io/jest/docs/en/configuration.html#reporters-array-modulename-modulename-options
   */

  this.onTestResult = (data: any, result: TestResult) => {
    // Catch console logs per test
    // TestResult will only contain console logs if Jest is run with verbose=false
    if (result.console) {
      consoleLogs.push({
        filePath: result.testFilePath,
        logs: result.console,
      });
    }
  };

  this.onRunComplete = (contexts: any, testResult: AggregatedResult) =>
    setupAndRun(testResult, options, globalConfig, consoleLogs);
}

export default JestHtmlReporter;
