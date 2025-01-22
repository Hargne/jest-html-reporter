import type { AggregatedResult, TestResult } from "@jest/test-result";
import type { Config } from "@jest/types";
import dateformat from "dateformat";
import fs from "fs";
import mkdirp from "mkdirp";
import path from "path";
import type {
  IJestHTMLReporterConfig,
  IJestHTMLReporterConfigOptions,
  IJestHTMLReporterConsole,
  JestHTMLReporterProps,
  JestHTMLReporterSortType,
} from "src/types";
import stripAnsi from "strip-ansi";
import xmlbuilder, { XMLElement } from "xmlbuilder";

import sorting from "./sorting";

class HTMLReporter {
  public testData: AggregatedResult;
  public consoleLogList: IJestHTMLReporterConsole[];
  public jestConfig: Config.GlobalConfig | undefined;
  public config: IJestHTMLReporterConfig;

  constructor(data: JestHTMLReporterProps) {
    this.testData = data.testData;
    this.jestConfig = data.jestConfig;
    this.consoleLogList = data.consoleLogs || [];
    this.config = {};
    this.setupConfig(data.options);
  }

  public async generate() {
    try {
      const report = await this.renderTestReport();
      const outputPath = this.replaceRootDirInPath(
        this.jestConfig ? this.jestConfig.rootDir : "",
        this.getConfigValue("outputPath") as string
      );
      await mkdirp(path.dirname(outputPath));

      let writeFullReport = true;
      if (this.getConfigValue("append") as boolean) {
        const fileExists = fs.existsSync(outputPath);
        if (fileExists) {
          await this.appendToFile(outputPath, report.content.toString());
          writeFullReport = false;
        }
      }
      if (writeFullReport) {
        fs.writeFileSync(outputPath, report.fullHtml.toString());
      }

      this.logMessage("success", `Report generated (${outputPath})`);
      return report.fullHtml;
    } catch (error) {
      this.logError(error);
    }
  }

  public async renderTestReport(): Promise<{
    fullHtml: string;
    content: string;
  }> {
    const reportContent = await this.renderTestReportContent();

    // Boilerplate Option
    if (this.getConfigValue("boilerplate")) {
      const boilerplatePath = this.replaceRootDirInPath(
        this.jestConfig ? this.jestConfig.rootDir : "",
        this.getConfigValue("boilerplate") as string
      );
      const boilerplateContent = fs.readFileSync(boilerplatePath, "utf8");
      const content = reportContent ? reportContent.toString() : "";
      return {
        content,
        fullHtml: boilerplateContent.replace(
          "{jesthtmlreporter-content}",
          content
        ),
      };
    }

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
      !this.getConfigValue("styleOverridePath");

    if (inlineCSS) {
      const stylesheetContent = fs.readFileSync(stylesheetFilePath, "utf8");
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
    if (this.getConfigValue("customScriptPath")) {
      reportBody.raw(
        `<script src="${this.getConfigValue("customScriptPath")}"></script>`
      );
    }
    return {
      fullHtml: report.toString(),
      content: reportContent ? reportContent.toString() : "",
    };
  }

  public renderTestSuiteHeader(
    parent: XMLElement,
    suite: TestResult,
    suiteIndex: number
  ) {
    const collapsibleBtnId = `collapsible-${suiteIndex}`;
    parent.ele("input", {
      id: collapsibleBtnId,
      type: "checkbox",
      class: "toggle",
      checked: !this.getConfigValue("collapseSuitesByDefault")
        ? "checked"
        : null,
    });
    const collapsibleBtnContainer = parent.ele("label", {
      for: collapsibleBtnId,
    });

    const suiteInfo = collapsibleBtnContainer.ele("div", {
      class: "suite-info",
    });
    suiteInfo.ele("div", { class: "suite-path" }, suite.testFilePath);
    const executionTime = (suite.perfStats.end - suite.perfStats.start) / 1000;
    const suiteExecutionTimeClass = ["suite-time"];
    if (
      executionTime >
      (this.getConfigValue("executionTimeWarningThreshold") as number)
    ) {
      suiteExecutionTimeClass.push("warn");
    }
    suiteInfo.ele(
      "div",
      { class: suiteExecutionTimeClass.join(" ") },
      `${executionTime}s`
    );
  }

  public async renderTestReportContent() {
    try {
      if (!this.testData || Object.entries(this.testData).length === 0) {
        throw Error("No test data provided");
      }

      // HTML Body
      const reportBody: XMLElement = xmlbuilder.begin().element("div", {
        class: "jesthtml-content",
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

      const getSummaryClass = (
        type: "passed" | "failed" | "pending",
        numberOfSuites: number
      ) =>
        [`summary-${type}`, numberOfSuites > 0 ? "" : " summary-empty"].join(
          " "
        );
      suiteSummary.ele(
        "div",
        { class: "summary-total" },
        `Suites (${this.testData.numTotalTestSuites})`
      );
      suiteSummary.ele(
        "div",
        {
          class: getSummaryClass("passed", this.testData.numPassedTestSuites),
        },
        `${this.testData.numPassedTestSuites} passed`
      );
      suiteSummary.ele(
        "div",
        {
          class: getSummaryClass("failed", this.testData.numFailedTestSuites),
        },
        `${this.testData.numFailedTestSuites} failed`
      );
      suiteSummary.ele(
        "div",
        {
          class: getSummaryClass("pending", this.testData.numPendingTestSuites),
        },
        `${this.testData.numPendingTestSuites} pending`
      );

      if (
        this.testData.snapshot &&
        this.testData.snapshot.unchecked > 0 &&
        this.getConfigValue("includeObsoleteSnapshots")
      ) {
        suiteSummary.ele(
          "div",
          {
            class: "summary-obsolete-snapshots",
          },
          `${this.testData.snapshot.unchecked} obsolete snapshots`
        );
      }
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
          class: getSummaryClass("passed", this.testData.numPassedTests),
        },
        `${this.testData.numPassedTests} passed`
      );
      testSummary.ele(
        "div",
        {
          class: getSummaryClass("failed", this.testData.numFailedTests),
        },
        `${this.testData.numFailedTests} failed`
      );
      testSummary.ele(
        "div",
        {
          class: getSummaryClass("pending", this.testData.numPendingTests),
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
        sortedTestResults.forEach((suite, suiteIndex) => {
          const suiteContainer = reportBody.ele("div", {
            id: `suite-${suiteIndex + 1}`,
            class: "suite-container",
          });
          // Suite Information
          this.renderTestSuiteHeader(suiteContainer, suite, suiteIndex);
          // Test Container
          const suiteTests = suiteContainer.ele("div", {
            class: "suite-tests",
          });

          // Ignore this suite if there are no results
          if (!suite.testResults || suite.testResults.length <= 0) {
            // Include the suite failure message if it exists
            if (
              suite.failureMessage &&
              this.getConfigValue("includeSuiteFailure")
            ) {
              const testResult = suiteTests.ele("div", {
                class: "test-result failed",
              });
              const failureMsgDiv = testResult.ele(
                "div",
                {
                  class: "failureMessages suiteFailure",
                },
                " "
              );
              failureMsgDiv.ele(
                "pre",
                { class: "failureMsg" },
                this.sanitizeOutput(suite.failureMessage)
              );
            }
            return;
          }

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
                test.duration ? `${test.duration / 1000}s` : " "
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
                test.failureMessages
                  .map((failureMsg) =>
                    !this.getConfigValue("includeStackTrace")
                      ? failureMsg
                          .split(/\n\s+at/)[0]
                          .trim()
                          .replace(/\n+$/, "")
                      : failureMsg
                  )
                  .forEach((failureMsg) => {
                    failureMsgDiv.ele(
                      "pre",
                      { class: "failureMsg" },
                      this.sanitizeOutput(failureMsg)
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
            this.renderSuiteConsoleLogs(suite, suiteContainer);
          }

          if (
            suite.snapshot &&
            suite.snapshot.unchecked > 0 &&
            this.getConfigValue("includeObsoleteSnapshots")
          ) {
            this.renderSuiteObsoleteSnapshots(suiteContainer, suite);
          }
        });
      }

      return reportBody;
    } catch (error) {
      this.logError(error);
    }
  }

  public renderSuiteConsoleLogs(
    suite: TestResult,
    suiteContainer: xmlbuilder.XMLElement
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
          this.sanitizeOutput(log.origin)
        );
        logElement.ele(
          "pre",
          { class: "suite-consolelog-item-message" },
          this.sanitizeOutput(log.message)
        );
      });
    }
  }

  public renderSuiteObsoleteSnapshots(
    suiteContainer: xmlbuilder.XMLElement,
    suite: TestResult
  ) {
    // Obsolete snapshots Container
    const snapshotContainer = suiteContainer.ele("div", {
      class: "suite-obsolete-snapshots",
    });
    // Obsolete snapshots Header
    snapshotContainer.ele(
      "div",
      { class: "suite-obsolete-snapshots-header" },
      "Obsolete snapshots"
    );
    const keysElement = snapshotContainer.ele("div", {
      class: "suite-obsolete-snapshots-item",
    });
    keysElement.ele(
      "pre",
      { class: "suite-obsolete-snapshots-item-message" },
      suite.snapshot.uncheckedKeys.join("\n")
    );
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
      collapseSuitesByDefault,
      customScriptPath,
      dateFormat,
      executionTimeWarningThreshold,
      logo,
      includeConsoleLog,
      includeFailureMsg,
      includeStackTrace,
      includeSuiteFailure,
      includeObsoleteSnapshots,
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
        defaultValue: undefined,
        environmentVariable: "JEST_HTML_REPORTER_BOILERPLATE",
        configValue: boilerplate,
      },
      collapseSuitesByDefault: {
        defaultValue: false,
        environmentVariable: "JEST_HTML_REPORTER_COLLAPSE_SUITES_BY_DEFAULT",
        configValue: collapseSuitesByDefault,
      },
      customScriptPath: {
        defaultValue: undefined,
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
        defaultValue: undefined,
        environmentVariable: "JEST_HTML_REPORTER_LOGO",
        configValue: logo,
      },
      includeFailureMsg: {
        defaultValue: false,
        environmentVariable: "JEST_HTML_REPORTER_INCLUDE_FAILURE_MSG",
        configValue: includeFailureMsg,
      },
      includeStackTrace: {
        defaultValue: true,
        environmentVariable: "JEST_HTML_REPORTER_INCLUDE_STACK_TRACE",
        configValue: includeStackTrace,
      },
      includeSuiteFailure: {
        defaultValue: false,
        environmentVariable: "JEST_HTML_REPORTER_INCLUDE_SUITE_FAILURE",
        configValue: includeSuiteFailure,
      },
      includeObsoleteSnapshots: {
        defaultValue: false,
        environmentVariable: "JEST_HTML_REPORTER_INCLUDE_OBSOLETE_SNAPSHOTS",
        configValue: includeObsoleteSnapshots,
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
        defaultValue: undefined,
        environmentVariable: "JEST_HTML_REPORTER_SORT",
        configValue: sort,
      },
      statusIgnoreFilter: {
        defaultValue: undefined,
        environmentVariable: "JEST_HTML_REPORTER_STATUS_FILTER",
        configValue: statusIgnoreFilter,
      },
      styleOverridePath: {
        defaultValue: undefined,
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
          if (
            key in this.config &&
            this.config[key as keyof IJestHTMLReporterConfig] !== undefined
          ) {
            this.config[key as keyof IJestHTMLReporterConfig]!.configValue =
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
          if (
            key in this.config &&
            this.config[key as keyof IJestHTMLReporterConfig] !== undefined
          ) {
            this.config[key as keyof IJestHTMLReporterConfig]!.configValue =
              parsedConfig[key];
          }
        }
        return this.config;
      }
    } catch (e) {
      /** do nothing */
    }
    return this.config;
  }

  /**
   * Returns the configured value from the config in the following priority order:
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
    return option.configValue ?? option.defaultValue;
  }

  /**
   * Appends the report to the given file and attempts to integrate the report into any existing HTML.
   * @param filePath
   * @param content
   */
  public async appendToFile(filePath: string, content: string) {
    let parsedContent = content;
    const fileToAppend = fs.readFileSync(filePath, "utf8");
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

  /**
   * Replaces <rootDir> in the file path with the actual path, as performed within Jest
   * Copy+paste from https://github.com/facebook/jest/blob/master/packages/jest-config/src/utils.ts
   * @param rootDir
   * @param filePath
   */
  public replaceRootDirInPath(
    rootDir: Config.GlobalConfig["rootDir"],
    filePath: Config.GlobalConfig["testPathPattern"]
  ): string {
    if (!/^<rootDir>/.test(filePath)) {
      return filePath;
    }

    return path.resolve(
      rootDir,
      path.normalize("./" + filePath.substring("<rootDir>".length))
    );
  }

  /**
   * Method for logging to the terminal
   * @param type
   * @param message
   * @param ignoreConsole
   */
  public logMessage(type: "default" | "success" | "error", message: string) {
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

  public logError(error: unknown) {
    const message =
      error instanceof Error ? error.message : "An error occurred";
    return this.logMessage("error", message);
  }

  /**
   * Helper method to sanitize output from invalid characters
   */
  private sanitizeOutput(input: string) {
    return stripAnsi(
      input
        .replace(/(\x1b\[\d*m)/g, "")
        .replace(
          /([^\x09\x0A\x0D\x20-\uD7FF\uE000-\uFFFC\u{10000}-\u{10FFFF}])/gu,
          ""
        )
    );
  }
}

export default HTMLReporter;
