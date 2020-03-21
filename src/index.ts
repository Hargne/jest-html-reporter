import { AggregatedResult, TestResult } from "@jest/test-result";
import { Circus, Config } from "@jest/types";

import { IJestHTMLReporterConsole } from "./index.d";
import { generateReport } from "./reporter";

function JestHtmlReporter(
  globalConfig: Config.GlobalConfig,
  options: Config.DefaultOptions
): Promise<Circus.TestResult> | Config.GlobalConfig {
  // Initiate the config and setup the Generator class
  const consoleLogs: IJestHTMLReporterConsole[] = [];

  /**
   * If the first parameter has a property named 'testResults',
   * the script is being run as a 'testResultsProcessor'.
   * We then need to return the test results as they were received from Jest
   * https://facebook.github.io/jest/docs/en/configuration.html#testresultsprocessor-string
   */
  if (Object.prototype.hasOwnProperty.call(globalConfig, "testResults")) {
    // Generate Report
    // @ts-ignore
    generateReport(globalConfig.testResults, consoleLogs);
    // Return the results as required by Jest
    return globalConfig;
  }

  /**
   * The default behaviour - run as Custom Reporter, in parallel with Jest.
   * This should eventually be turned into a proper class (whenever the testResultsProcessor option is phased out)
   * https://facebook.github.io/jest/docs/en/configuration.html#reporters-array-modulename-modulename-options
   */
  this.jestConfig = globalConfig;
  this.jestOptions = options;

  this.onTestResult = (data: any, result: TestResult) => {
    // Catch console logs per test
    if (result.console) {
      consoleLogs.push({
        filePath: result.testFilePath,
        logs: result.console
      });
    }
  };

  this.onRunComplete = (
    contexts: Circus.TestContext,
    testResult: AggregatedResult
  ) => {
    generateReport(testResult, consoleLogs);
  };
}

module.exports = JestHtmlReporter;
