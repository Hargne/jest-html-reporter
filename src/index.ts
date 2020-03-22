import { AggregatedResult, TestResult } from "@jest/test-result";
import { Circus, Config } from "@jest/types";

import htmlreporter from "./htmlreporter";
import { IJestHTMLReporterConsole, IJestHTMLReporterOptions } from "./types";

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
    const reporter = new htmlreporter(
      // @ts-ignore
      globalConfig.testResults,
      options as IJestHTMLReporterOptions
    );
    reporter.generate();
    // Return the results as required by Jest
    return globalConfig;
  }

  /**
   * The default behaviour - run as Custom Reporter, in parallel with Jest.
   * This should eventually be turned into a proper class (whenever the testResultsProcessor option is phased out)
   * https://facebook.github.io/jest/docs/en/configuration.html#reporters-array-modulename-modulename-options
   */

  const onTestResult = (data: any, result: TestResult) => {
    // Catch console logs per test
    if (result.console) {
      consoleLogs.push({
        filePath: result.testFilePath,
        logs: result.console
      });
    }
  };

  const onRunComplete = (contexts: any, testResult: AggregatedResult) => {
    const reporter = new htmlreporter(
      testResult,
      options as IJestHTMLReporterOptions
    );
    return reporter.generate();
  };
}

export default JestHtmlReporter;
