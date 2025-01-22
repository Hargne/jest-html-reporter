import type { AggregatedResult, TestResult } from "@jest/test-result";
import type { Config } from "@jest/types";
import type { Reporter } from "@jest/reporters";

import htmlreporter from "./htmlreporter";
import {
  IJestHTMLReporterConfigOptions,
  IJestHTMLReporterConsole,
  JestHTMLReporterProps,
} from "./types";

class JestHtmlReporter implements Reporter {
  private readonly globalConfig: Config.GlobalConfig;
  private readonly options: IJestHTMLReporterConfigOptions;
  private readonly consoleLogs: IJestHTMLReporterConsole[] = [];

  constructor(
    globalConfig: Config.GlobalConfig,
    options: IJestHTMLReporterConfigOptions
  ) {
    this.globalConfig = globalConfig;
    this.options = options;
  }

  /**
   * Jest invokes this method after every test result.
   */
  onTestResult(_contexts: any, result: TestResult): void {
    if (result.console) {
      this.consoleLogs.push({
        filePath: result.testFilePath,
        logs: result.console,
      });
    }
  }

  /**
   * Jest invokes this method when the entire test suite run is complete.
   */
  onRunComplete(_contexts: any, testData: AggregatedResult): void {
    setupAndRun({
      testData,
      options: this.options,
      jestConfig: this.globalConfig,
      consoleLogs: this.consoleLogs,
    });
  }

  /**
   * Jest invokes this method to check if the reporter should force exit.
   */
  getLastError(): Error | void {
    return undefined;
  }
}

/**
 * Setup Jest HTML Reporter and generate a report with the given data
 */
const setupAndRun = (data: JestHTMLReporterProps) => {
  const reporter = new htmlreporter(data);
  return reporter.generate();
};

export default JestHtmlReporter;
