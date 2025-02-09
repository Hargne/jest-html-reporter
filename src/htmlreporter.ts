import type { AggregatedResult, TestResult } from "@jest/test-result";
import type { Config } from "@jest/types";
import dateformat from "dateformat";
import fs from "fs";
import mkdirp from "mkdirp";
import path from "path";
import type {
  JestHTMLReporterConsoleLogList,
  JestHTMLReporterConfiguration,
  JestHTMLReporterProps,
  JestHTMLReporterSortType,
} from "src/types";
import xmlbuilder, { XMLElement } from "xmlbuilder";

import sorting from "./sorting";
import * as utils from "./utils";
import extractConfiguration from "./extractConfiguration";

class HTMLReporter {
  public testData: AggregatedResult;
  public consoleLogList: JestHTMLReporterConsoleLogList[];
  public jestConfig: Config.GlobalConfig | undefined;
  public config: JestHTMLReporterConfiguration;

  constructor(data: JestHTMLReporterProps) {
    this.testData = data.testData;
    this.jestConfig = data.jestConfig;
    this.consoleLogList = data.consoleLogs || [];
    this.config = extractConfiguration(data.options);
  }

  public async generate() {
    try {
      const report = await this.renderTestReport();
      const outputPath = utils.replaceRootDirInPath(
        this.jestConfig ? this.jestConfig.rootDir : "",
        this.getConfigValue("outputPath") as string
      );
      await mkdirp(path.dirname(outputPath));

      let writeFullReport = true;
      if (this.getConfigValue("append") as boolean) {
        const fileExists = fs.existsSync(outputPath);
        if (fileExists) {
          await utils.appendToHTML(outputPath, report.content.toString());
          writeFullReport = false;
        }
      }
      if (writeFullReport) {
        fs.writeFileSync(outputPath, report.fullHtml.toString());
      }

      utils.logMessage("success", `Report generated (${outputPath})`);
      return report.fullHtml;
    } catch (error) {
      utils.logError(error);
    }
  }

  public async renderTestReport(): Promise<{
    fullHtml: string;
    content: string;
  }> {
    const reportContent = await this.renderTestReportContent();

    // Boilerplate Option
    if (this.getConfigValue("boilerplate")) {
      const boilerplatePath = utils.replaceRootDirInPath(
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

  public renderTestSuiteHeader(parent: XMLElement, suite: TestResult) {
    const accordionHeader = parent.ele("summary", {
      class: "suite-info",
    });

    accordionHeader.ele("div", { class: "suite-path" }, suite.testFilePath);
    const executionTime = (suite.perfStats.end - suite.perfStats.start) / 1000;
    const suiteExecutionTimeClass = ["suite-time"];
    if (
      executionTime >
      (this.getConfigValue("executionTimeWarningThreshold") as number)
    ) {
      suiteExecutionTimeClass.push("warn");
    }
    accordionHeader.ele(
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
      const reportBody: XMLElement = xmlbuilder.begin().element("main", {
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
      const metaDataContainer = reportBody.ele("section", {
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
          const suiteContainer = reportBody.ele("details", {
            id: `suite-${suiteIndex + 1}`,
            class: "suite-container",
            open: !this.getConfigValue("collapseSuitesByDefault")
              ? ""
              : undefined,
          });
          // Suite Information
          this.renderTestSuiteHeader(suiteContainer, suite);
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
                utils.sanitizeOutput(suite.failureMessage)
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
                      utils.sanitizeOutput(failureMsg)
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
      utils.logError(error);
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
          utils.sanitizeOutput(log.origin)
        );
        logElement.ele(
          "pre",
          { class: "suite-consolelog-item-message" },
          utils.sanitizeOutput(log.message)
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
   * Returns the configured value from the config in the following priority order:
   * Environment Variable > JSON configured value > Default value
   * @param key
   */
  public getConfigValue(key: keyof JestHTMLReporterConfiguration) {
    return this.config[key];
  }
}

export default HTMLReporter;
