import { AggregatedResult } from "@jest/test-result";
import { Config } from "@jest/types";
import dateformat from "dateformat";
import fs from "fs";
import mkdirp from "mkdirp";
import path from "path";
import {
  IJestHTMLReporterConfig,
  IJestHTMLReporterConfigOptions,
  IJestHTMLReporterConsole,
  JestHTMLReporterSortType,
} from "src/types";
import stripAnsi from "strip-ansi";
import xmlbuilder, { XMLElement } from "xmlbuilder";

import sorting from "./sorting";

class HTMLReporter {
  public testData: AggregatedResult;
  public consoleLogList: IJestHTMLReporterConsole[];
  public jestConfig: Config.GlobalConfig;
  public config: IJestHTMLReporterConfig;

  constructor(
    testData: AggregatedResult,
    options: IJestHTMLReporterConfigOptions,
    jestConfig: Config.GlobalConfig,
    consoleLogs?: IJestHTMLReporterConsole[]
  ) {
    this.testData = testData;
    this.jestConfig = jestConfig;
    this.consoleLogList = consoleLogs;
    this.setupConfig(options);
  }

  public async generate() {
    try {
      const report = await this.renderTestReport();
      const outputPath = this.replaceRootDirInPath(
        this.jestConfig ? this.jestConfig.rootDir : "",
        this.getConfigValue("outputPath") as string
      );

      await mkdirp(path.dirname(outputPath));
      if (this.getConfigValue("append") as boolean) {
        await this.appendToFile(outputPath, report.toString());
      } else {
        await fs.writeFileSync(outputPath, report.toString());
      }

      this.logMessage("success", `Report generated (${outputPath})`);
      return report;
    } catch (e) {
      this.logMessage("error", e);
    }
  }

  public async renderTestReport() {
    // Generate the content of the test report
    const reportContent = await this.renderTestReportContent();

    // --

    // Boilerplate Option
    if (!!this.getConfigValue("boilerplate")) {
      const boilerplateContent = await fs.readFileSync(
        this.getConfigValue("boilerplate") as string,
        "utf8"
      );
      return boilerplateContent.replace(
        "{jesthtmlreporter-content}",
        reportContent && reportContent.toString()
      );
    }

    // --

    // Create HTML and apply reporter content
    const report = xmlbuilder.create({ html: {} });
    const headTag = report.ele("head");
    headTag.ele("meta", { charset: "utf-8" });
    headTag.ele("title", {}, this.getConfigValue("pageTitle"));

    // Default to the currently set theme
    let stylesheetFilePath: string = path.join(
      __dirname,
      `../style/${this.getConfigValue("theme")}.css`
    );
    // Overriding stylesheet
    if (this.getConfigValue("styleOverridePath")) {
      stylesheetFilePath = this.getConfigValue("styleOverridePath") as string;
    }
    // Decide whether to inline the CSS or not
    const inlineCSS: boolean =
      !this.getConfigValue("useCssFile") &&
      !!!this.getConfigValue("styleOverridePath");

    if (inlineCSS) {
      const stylesheetContent = await fs.readFileSync(
        stylesheetFilePath,
        "utf8"
      );
      headTag.raw(`<style type="text/css">${stylesheetContent}</style>`);
    } else {
      headTag.ele("link", {
        rel: "stylesheet",
        type: "text/css",
        href: stylesheetFilePath,
      });
    }

    const reportBody = report.ele("body");
    // Add the test report to the body
    if (reportContent) {
      reportBody.raw(reportContent.toString());
    }
    // Add any given custom script to the end of the body
    if (!!this.getConfigValue("customScriptPath")) {
      reportBody.raw(
        `<script src="${this.getConfigValue("customScriptPath")}"></script>`
      );
    }
    return report;
  }

  public async renderTestReportContent() {
    try {
      if (!this.testData || Object.entries(this.testData).length === 0) {
        throw Error("No test data provided");
      }

      // HTML Body
      const reportBody: XMLElement = xmlbuilder.begin().element("div", {
        id: "jesthtml-content",
      });

      /**
       * Page Header
       */
      const header = reportBody.ele("header");
      // Page Title
      header.ele("h1", { id: "title" }, this.getConfigValue("pageTitle"));

      // Logo
      const logo = this.getConfigValue("logo");
      if (logo) {
        header.ele("img", { id: "logo", src: logo });
      }

      /**
       * Meta-Data
       */
      const metaDataContainer = reportBody.ele("div", {
        id: "metadata-container",
      });
      // Timestamp
      if (this.testData.startTime && !isNaN(this.testData.startTime)) {
        const timestamp = new Date(this.testData.startTime);
        if (timestamp) {
          const formattedTimestamp = dateformat(
            timestamp,
            this.getConfigValue("dateFormat") as string
          );
          metaDataContainer.ele(
            "div",
            { id: "timestamp" },
            `Started: ${formattedTimestamp}`
          );
        }
      }

      // Summary
      const summaryContainer = metaDataContainer.ele("div", { id: "summary" });
      // Suite Summary
      const suiteSummary = summaryContainer.ele("div", { id: "suite-summary" });
      suiteSummary.ele(
        "div",
        { class: "summary-total" },
        `Suites (${this.testData.numTotalTestSuites})`
      );
      suiteSummary.ele(
        "div",
        {
          class: `summary-passed${
            this.testData.numPassedTestSuites === 0 ? " summary-empty" : ""
          }`,
        },
        `${this.testData.numPassedTestSuites} passed`
      );
      suiteSummary.ele(
        "div",
        {
          class: `summary-failed${
            this.testData.numFailedTestSuites === 0 ? " summary-empty" : ""
          }`,
        },
        `${this.testData.numFailedTestSuites} failed`
      );
      suiteSummary.ele(
        "div",
        {
          class: `summary-pending${
            this.testData.numPendingTestSuites === 0 ? " summary-empty" : ""
          }`,
        },
        `${this.testData.numPendingTestSuites} pending`
      );

      // Test Summary
      const testSummary = summaryContainer.ele("div", { id: "test-summary" });
      testSummary.ele(
        "div",
        { class: "summary-total" },
        `Tests (${this.testData.numTotalTests})`
      );
      testSummary.ele(
        "div",
        {
          class: `summary-passed${
            this.testData.numPassedTests === 0 ? " summary-empty" : ""
          }`,
        },
        `${this.testData.numPassedTests} passed`
      );
      testSummary.ele(
        "div",
        {
          class: `summary-failed${
            this.testData.numFailedTests === 0 ? " summary-empty" : ""
          }`,
        },
        `${this.testData.numFailedTests} failed`
      );
      testSummary.ele(
        "div",
        {
          class: `summary-pending${
            this.testData.numPendingTests === 0 ? " summary-empty" : ""
          }`,
        },
        `${this.testData.numPendingTests} pending`
      );

      /**
       * Apply any given sorting method to the test results
       */
      const sortedTestResults = sorting(
        this.testData.testResults,
        this.getConfigValue("sort") as JestHTMLReporterSortType
      );

      /**
       * Setup ignored test result statuses
       */
      const statusIgnoreFilter = this.getConfigValue(
        "statusIgnoreFilter"
      ) as string;
      let ignoredStatuses: string[] = [];
      if (statusIgnoreFilter) {
        ignoredStatuses = statusIgnoreFilter
          .replace(/\s/g, "")
          .toLowerCase()
          .split(",");
      }

      /**
       * Test Suites
       */
      if (sortedTestResults) {
        sortedTestResults.map((suite, i) => {
          // Ignore this suite if there are no results
          if (!suite.testResults || suite.testResults.length <= 0) {
            return;
          }

          const suiteContainer = reportBody.ele("div", {
            id: `suite-${i + 1}`,
            class: "suite-container",
          });

          // Suite Information
          const suiteInfo = suiteContainer.ele("div", { class: "suite-info" });
          // Suite Path
          suiteInfo.ele("div", { class: "suite-path" }, suite.testFilePath);
          // Suite execution time
          const executionTime =
            (suite.perfStats.end - suite.perfStats.start) / 1000;
          suiteInfo.ele(
            "div",
            {
              class: `suite-time${
                executionTime >
                (this.getConfigValue("executionTimeWarningThreshold") as number)
                  ? " warn"
                  : ""
              }`,
            },
            `${executionTime}s`
          );

          // Test Container
          const suiteTests = suiteContainer.ele("div", {
            class: "suite-tests",
          });

          // Test Results
          suite.testResults
            // Filter out the test results with statuses that equals the statusIgnoreFilter
            .filter((s) => !ignoredStatuses.includes(s.status))
            .forEach(async (test) => {
              const testResult = suiteTests.ele("div", {
                class: `test-result ${test.status}`,
              });

              // Test Info
              const testInfo = testResult.ele("div", { class: "test-info" });
              // Suite Name
              testInfo.ele(
                "div",
                { class: "test-suitename" },
                test.ancestorTitles && test.ancestorTitles.length > 0
                  ? test.ancestorTitles.join(" > ")
                  : " "
              );
              // Test Title
              testInfo.ele("div", { class: "test-title" }, test.title);
              // Test Status
              testInfo.ele("div", { class: "test-status" }, test.status);
              // Test Duration
              testInfo.ele(
                "div",
                { class: "test-duration" },
                `${test.duration / 1000}s`
              );

              // Test Failure Messages
              if (
                test.failureMessages &&
                test.failureMessages.length > 0 &&
                this.getConfigValue("includeFailureMsg")
              ) {
                const failureMsgDiv = testResult.ele(
                  "div",
                  {
                    class: "failureMessages",
                  },
                  " "
                );
                test.failureMessages.forEach((failureMsg) => {
                  failureMsgDiv.ele(
                    "pre",
                    { class: "failureMsg" },
                    stripAnsi(failureMsg)
                  );
                });
              }
            });

          // All console.logs caught during the test run
          if (
            this.consoleLogList &&
            this.consoleLogList.length > 0 &&
            this.getConfigValue("includeConsoleLog")
          ) {
            // Filter out the logs for this test file path
            const filteredConsoleLogs = this.consoleLogList.find(
              (logs) => logs.filePath === suite.testFilePath
            );
            if (filteredConsoleLogs && filteredConsoleLogs.logs.length > 0) {
              // Console Log Container
              const consoleLogContainer = suiteContainer.ele("div", {
                class: "suite-consolelog",
              });
              // Console Log Header
              consoleLogContainer.ele(
                "div",
                { class: "suite-consolelog-header" },
                "Console Log"
              );
              // Apply the logs to the body
              filteredConsoleLogs.logs.forEach((log) => {
                const logElement = consoleLogContainer.ele("div", {
                  class: "suite-consolelog-item",
                });
                logElement.ele(
                  "pre",
                  { class: "suite-consolelog-item-origin" },
                  stripAnsi(log.origin)
                );
                logElement.ele(
                  "pre",
                  { class: "suite-consolelog-item-message" },
                  stripAnsi(log.message)
                );
              });
            }
          }
        });
      }

      return reportBody;
    } catch (e) {
      this.logMessage("error", e);
    }
  }

  /**
   * Fetch and setup configuration
   */
  public setupConfig(
    options: IJestHTMLReporterConfigOptions
  ): IJestHTMLReporterConfig {
    // Extract config values and make sure that the config object actually exist
    const {
      append,
      boilerplate,
      customScriptPath,
      dateFormat,
      executionTimeWarningThreshold,
      logo,
      includeConsoleLog,
      includeFailureMsg,
      outputPath,
      pageTitle,
      theme,
      sort,
      statusIgnoreFilter,
      styleOverridePath,
      useCssFile,
    } = options || {};

    this.config = {
      append: {
        defaultValue: false,
        environmentVariable: "JEST_HTML_REPORTER_APPEND",
        configValue: append,
      },
      boilerplate: {
        defaultValue: null,
        environmentVariable: "JEST_HTML_REPORTER_BOILERPLATE",
        configValue: boilerplate,
      },
      customScriptPath: {
        defaultValue: null,
        environmentVariable: "JEST_HTML_REPORTER_CUSTOM_SCRIPT_PATH",
        configValue: customScriptPath,
      },
      dateFormat: {
        defaultValue: "yyyy-mm-dd HH:MM:ss",
        environmentVariable: "JEST_HTML_REPORTER_DATE_FORMAT",
        configValue: dateFormat,
      },
      executionTimeWarningThreshold: {
        defaultValue: 5,
        environmentVariable:
          "JEST_HTML_REPORTER_EXECUTION_TIME_WARNING_THRESHOLD",
        configValue: executionTimeWarningThreshold,
      },
      logo: {
        defaultValue: null,
        environmentVariable: "JEST_HTML_REPORTER_LOGO",
        configValue: logo,
      },
      includeFailureMsg: {
        defaultValue: false,
        environmentVariable: "JEST_HTML_REPORTER_INCLUDE_FAILURE_MSG",
        configValue: includeFailureMsg,
      },
      includeConsoleLog: {
        defaultValue: false,
        environmentVariable: "JEST_HTML_REPORTER_INCLUDE_CONSOLE_LOG",
        configValue: includeConsoleLog,
      },
      outputPath: {
        defaultValue: path.join(process.cwd(), "test-report.html"),
        environmentVariable: "JEST_HTML_REPORTER_OUTPUT_PATH",
        configValue: outputPath,
      },
      pageTitle: {
        defaultValue: "Test Report",
        environmentVariable: "JEST_HTML_REPORTER_PAGE_TITLE",
        configValue: pageTitle,
      },
      theme: {
        defaultValue: "defaultTheme",
        environmentVariable: "JEST_HTML_REPORTER_THEME",
        configValue: theme,
      },
      sort: {
        defaultValue: null,
        environmentVariable: "JEST_HTML_REPORTER_SORT",
        configValue: sort,
      },
      statusIgnoreFilter: {
        defaultValue: null,
        environmentVariable: "JEST_HTML_REPORTER_STATUS_FILTER",
        configValue: statusIgnoreFilter,
      },
      styleOverridePath: {
        defaultValue: null,
        environmentVariable: "JEST_HTML_REPORTER_STYLE_OVERRIDE_PATH",
        configValue: styleOverridePath,
      },
      useCssFile: {
        defaultValue: false,
        environmentVariable: "JEST_HTML_REPORTER_USE_CSS_FILE",
        configValue: useCssFile,
      },
    };
    // Attempt to collect and assign config settings from jesthtmlreporter.config.json
    try {
      const jesthtmlreporterconfig = fs.readFileSync(
        path.join(process.cwd(), "jesthtmlreporter.config.json"),
        "utf8"
      );
      if (jesthtmlreporterconfig) {
        const parsedConfig = JSON.parse(jesthtmlreporterconfig);
        for (const key of Object.keys(parsedConfig)) {
          if (this.config[key as keyof IJestHTMLReporterConfig]) {
            this.config[key as keyof IJestHTMLReporterConfig].configValue =
              parsedConfig[key];
          }
        }
        return this.config;
      }
    } catch (e) {
      /** do nothing */
    }
    // If above method did not work we attempt to check package.json
    try {
      const packageJson = fs.readFileSync(
        path.join(process.cwd(), "package.json"),
        "utf8"
      );
      if (packageJson) {
        const parsedConfig = JSON.parse(packageJson)["jest-html-reporter"];
        for (const key of Object.keys(parsedConfig)) {
          if (this.config[key as keyof IJestHTMLReporterConfig]) {
            this.config[key as keyof IJestHTMLReporterConfig].configValue =
              parsedConfig[key];
          }
        }
        return this.config;
      }
    } catch (e) {
      /** do nothing */
    }
  }

  /**
   * Returns the configurated value from the config in the following priority order:
   * Environment Variable > JSON configured value > Default value
   * @param key
   */
  public getConfigValue(key: keyof IJestHTMLReporterConfig) {
    const option = this.config[key];
    if (!option) {
      return;
    }
    if (process.env[option.environmentVariable]) {
      return process.env[option.environmentVariable];
    }
    return option.configValue || option.defaultValue;
  }

  /**
   * Appends the report to the given file and attempts to integrate the report into any existing HTML.
   * @param filePath
   * @param content
   */
  public async appendToFile(filePath: string, content: any) {
    let parsedContent = content;
    // Check if the file exists or not
    const fileToAppend = await fs.readFileSync(filePath, "utf8");
    // The file exists - we need to strip all unecessary html
    if (fileToAppend) {
      const contentSearch = /<body>(.*?)<\/body>/gm.exec(content);
      if (contentSearch) {
        const [strippedContent] = contentSearch;
        parsedContent = strippedContent;
      }
      // Then we need to add the stripped content just before the </body> tag
      let newContent = fileToAppend;
      const closingBodyTag = /<\/body>/gm.exec(fileToAppend);
      const indexOfClosingBodyTag = closingBodyTag ? closingBodyTag.index : 0;

      newContent = [
        fileToAppend.slice(0, indexOfClosingBodyTag),
        parsedContent,
        fileToAppend.slice(indexOfClosingBodyTag),
      ].join("");

      return fs.writeFileSync(filePath, newContent);
    }
    return fs.appendFileSync(filePath, parsedContent);
  }

  /**
   * Replaces <rootDir> in the file path with the actual path, as performed within Jest
   * Copy+paste from https://github.com/facebook/jest/blob/master/packages/jest-config/src/utils.ts
   * @param rootDir
   * @param filePath
   */
  public replaceRootDirInPath(
    rootDir: Config.Path,
    filePath: Config.Path
  ): string {
    if (!/^<rootDir>/.test(filePath)) {
      return filePath;
    }

    return path.resolve(
      rootDir,
      path.normalize("./" + filePath.substr("<rootDir>".length))
    );
  }

  /**
   * Method for logging to the terminal
   * @param type
   * @param message
   * @param ignoreConsole
   */
  public logMessage(
    type: "default" | "success" | "error" = "default",
    message: string
  ) {
    const logTypes = {
      default: "\x1b[37m%s\x1b[0m",
      success: "\x1b[32m%s\x1b[0m",
      error: "\x1b[31m%s\x1b[0m",
    };
    const logColor = !logTypes[type] ? logTypes.default : logTypes[type];
    const logMsg = `jest-html-reporter >> ${message}`;
    // Let's log messages to the terminal only if we aren't testing this very module
    if (process.env.JEST_WORKER_ID === undefined) {
      console.log(logColor, logMsg);
    }
    return { logColor, logMsg }; // Return for testing purposes
  }
}

export default HTMLReporter;
