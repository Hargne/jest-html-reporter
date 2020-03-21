import { AggregatedResult } from "@jest/test-result";
import dateformat from "dateformat";
import fs from "fs";
import mkdirp from "mkdirp";
import path from "path";
import stripAnsi from "strip-ansi";
import xmlbuilder, { XMLElement } from "xmlbuilder";

import { getConfigValue } from "./config";
import { IJestHTMLReporterConsole, JestHTMLReporterSortType } from "./index.d";
import { sortTestResults } from "./sortingMethods";
import { getFileContent, logMessage } from "./utils";

export const generateReport = async (
  testData: AggregatedResult,
  consoleLogs: IJestHTMLReporterConsole[]
) => {
  try {
    const report = await generateHTMLReport(testData, consoleLogs);

    const outputPath = getConfigValue("outputPath") as string;
    await mkdirp(path.dirname(outputPath));
    await fs.writeFile(outputPath, report, writeFileError => {
      if (writeFileError) {
        throw new Error(
          `Something went wrong when creating the file: ${writeFileError}`
        );
      }
    });
    logMessage("success", `Report generated (${outputPath})`);
    return outputPath;
  } catch (e) {
    logMessage("error", e);
    return;
  }
};

const generateHTMLReport = async (
  testData: AggregatedResult,
  consoleLogs: IJestHTMLReporterConsole[]
) => {
  try {
    // Generate the content of the test report
    const reportContent = await generateReportContent({
      testData,
      consoleLogs
    });

    // --

    // Boilerplate Option
    if (!!getConfigValue("boilerplate")) {
      const boilerplateContent = await getFileContent(
        getConfigValue("boilerplate") as string
      );
      return boilerplateContent.replace(
        "{jesthtmlreporter-content}",
        reportContent.toString()
      );
    }

    // --

    // Create HTML and apply reporter content
    const HTMLBase = {
      html: {
        head: {
          meta: { "@charset": "utf-8" },
          title: { "#text": getConfigValue("pageTitle") },
          style: undefined as object,
          link: undefined as object
        }
      }
    };
    // Default to the currently set theme
    let stylesheetFilePath: string = path.join(
      __dirname,
      `../style/${getConfigValue("theme")}.css`
    );
    // Overriding stylesheet
    if (getConfigValue("styleOverridePath")) {
      stylesheetFilePath = getConfigValue("styleOverridePath") as string;
    }
    // Decide whether to inline the CSS or not
    const inlineCSS: boolean =
      !getConfigValue("useCssFile") && !!!getConfigValue("styleOverridePath");

    if (inlineCSS) {
      const stylesheetContent = await fs.readFileSync(
        stylesheetFilePath,
        "utf8"
      );
      HTMLBase.html.head.style = {
        "@type": "text/css",
        "#text": stylesheetContent
      };
    } else {
      HTMLBase.html.head.link = {
        "@rel": "stylesheet",
        "@type": "text/css",
        "@href": stylesheetFilePath
      };
    }
    const report = xmlbuilder.create(HTMLBase);
    report.ele("body").raw(reportContent.toString());
    return report;
  } catch (e) {
    logMessage("error", e);
    return;
  }
};

/**
 * Returns a rendered HTML report based on test data
 */
const generateReportContent = async ({
  testData,
  consoleLogs
}: {
  testData: AggregatedResult;
  consoleLogs: IJestHTMLReporterConsole[];
}): Promise<XMLElement> => {
  try {
    if (!testData) {
      throw Error("No test data provided");
    }

    // HTML Body
    const reportBody: XMLElement = xmlbuilder.begin().element("div", {
      id: "jesthtml-content"
    });

    /**
     * Page Header
     */
    const header = reportBody.ele("header");
    // Page Title
    header.ele("h1", { id: "title" }, getConfigValue("pageTitle"));

    // Logo
    const logo = getConfigValue("logo");
    if (logo) {
      header.ele("img", { id: "logo", src: logo });
    }

    /**
     * Meta-Data
     */
    const metaDataContainer = reportBody.ele("div", {
      id: "metadata-container"
    });
    // Timestamp
    const timestamp = new Date(testData.startTime);
    metaDataContainer.ele(
      "div",
      { id: "timestamp" },
      `Start: ${dateformat(
        timestamp.toDateString(),
        getConfigValue("dateFormat") as string
      )}`
    );
    // Test Summary
    metaDataContainer.ele(
      "div",
      { id: "summary" },
      `${testData.numTotalTests} tests -- ${testData.numPassedTests} passed / ${testData.numFailedTests} failed / ${testData.numPendingTests} pending`
    );

    /**
     * Apply any given sorting method to the test results
     */
    const sortedTestResults = sortTestResults(
      testData.testResults,
      getConfigValue("sort") as JestHTMLReporterSortType
    );

    /**
     * Setup ignored test result statuses
     */
    const statusIgnoreFilter = getConfigValue("statusIgnoreFilter") as string;
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
    sortedTestResults.map(suite => {
      // Filter out the test results with statuses that equals the statusIgnoreFilter
      for (const [i, result] of suite.testResults.entries()) {
        if (ignoredStatuses.includes(result.status)) {
          suite.testResults.splice(i, 1);
        }
      }

      // Ignore this suite if there are no results
      if (!suite.testResults || suite.testResults.length <= 0) {
        return;
      }

      // Suite Information
      const suiteInfo = reportBody.ele("div", { class: "suite-info" });
      // Suite Path
      suiteInfo.ele("div", { class: "suite-path" }, suite.testFilePath);
      // Suite execution time
      const executionTime =
        (suite.perfStats.end - suite.perfStats.start) / 1000;
      suiteInfo.ele(
        "div",
        { class: `suite-time${executionTime > 5 ? " warn" : ""}` },
        `${executionTime}s`
      );

      // Suite Test Table
      const suiteTable = reportBody.ele("table", {
        class: "suite-table",
        cellspacing: "0",
        cellpadding: "0"
      });
      // Test Results
      suite.testResults.forEach(test => {
        const testTr = suiteTable.ele("tr", { class: test.status });
        // Suite Name(s)
        testTr.ele("td", { class: "suite" }, test.ancestorTitles.join(" > "));
        // Test name
        const testTitleTd = testTr.ele("td", { class: "test" }, test.title);
        // Test Failure Messages
        if (test.failureMessages && getConfigValue("includeFailureMsg")) {
          const failureMsgDiv = testTitleTd.ele("div", {
            class: "failureMessages"
          });
          test.failureMessages.forEach(failureMsg => {
            failureMsgDiv.ele(
              "pre",
              { class: "failureMsg" },
              stripAnsi(failureMsg)
            );
          });
        }
        // Append data to <tr>
        testTr.ele(
          "td",
          { class: "result" },
          test.status === "passed"
            ? `${test.status} in ${test.duration / 1000}s`
            : test.status
        );
      });

      // All console.logs caught during the test run
      if (
        consoleLogs &&
        consoleLogs.length > 0 &&
        getConfigValue("includeConsoleLog")
      ) {
        // Filter out the logs for this test file path
        const filteredConsoleLogs = consoleLogs.find(
          logs => logs.filePath === suite.testFilePath
        );
        if (filteredConsoleLogs && filteredConsoleLogs.logs.length > 0) {
          // Console Log Container
          const consoleLogContainer = reportBody.ele("div", {
            class: "suite-consolelog"
          });
          // Console Log Header
          consoleLogContainer.ele(
            "div",
            { class: "suite-consolelog-header" },
            "Console Log"
          );
          // Apply the logs to the body
          filteredConsoleLogs.logs.forEach(log => {
            const logElement = consoleLogContainer.ele("div", {
              class: "suite-consolelog-item"
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

    return reportBody;
  } catch (e) {
    logMessage("error", e);
  }
};
