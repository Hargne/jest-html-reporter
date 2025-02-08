import fs from "fs";

import HTMLReporter from "./htmlreporter";
import { mockAggregatedResultSingle } from "./__mock__/mockAggregatedResultSingle";
import mockAggregatedResultMultiple from "./__mock__/mockAggregatedResultMultiple";

describe("HTMLReporter", () => {
  describe("generate", () => {
    it("should be able to generate a HTML report", async () => {
      const mockedFS = jest.spyOn(fs, "writeFileSync");
      mockedFS.mockImplementation();

      const reporter = new HTMLReporter({
        testData: mockAggregatedResultSingle,
        options: {},
      });
      const report = await reporter.generate();
      expect(report).toBeDefined();
      expect(report?.toString().substring(0, 6)).toEqual("<html>");
      mockedFS.mockRestore();
    });
  });

  describe("renderTestReportContent", () => {
    it("should cast an error if no test data was provided", async () => {
      expect.assertions(1);
      // @ts-expect-error - Testing invalid input
      const reporter = new HTMLReporter({}, {});
      expect(await reporter.renderTestReportContent()).toBeUndefined();
    });
  });

  describe("getConfigValue", () => {
    it("should return configured environment variable", async () => {
      process.env.JEST_HTML_REPORTER_LOGO = "logoFromEnv.png";
      const reporter = new HTMLReporter({
        testData: mockAggregatedResultSingle,
        options: {},
      });
      const reportContent = await reporter.renderTestReportContent();
      expect(reportContent).toBeDefined();
      expect(
        reportContent
          ?.toString()
          .indexOf('<img id="logo" src="logoFromEnv.png"/>')
      ).toBeGreaterThan(-1);
      delete process.env.JEST_HTML_REPORTER_LOGO;
    });
  });

  describe("config options", () => {
    describe("styleOverridePath", () => {
      it("should insert a link to the overriding stylesheet path", async () => {
        const reporter = new HTMLReporter({
          testData: mockAggregatedResultSingle,
          options: {
            styleOverridePath: "path/to/style.css",
          },
        });
        const report = await reporter.renderTestReport();
        expect(
          report.fullHtml.indexOf(
            '<link rel="stylesheet" type="text/css" href="path/to/style.css"/>'
          ) !== -1
        ).toBeTruthy();
      });
    });

    describe("includeConsoleLog", () => {
      it("should add found console.logs to the report if includeConsoleLog is set", async () => {
        const reporter = new HTMLReporter({
          testData: mockAggregatedResultSingle,
          options: {
            includeConsoleLog: true,
          },
          consoleLogs: [
            {
              filePath: mockAggregatedResultSingle.testResults[0].testFilePath,
              logs: [
                {
                  message: "This is a console log",
                  origin: "origin",
                  type: "log",
                },
              ],
            },
          ],
        });
        const reportContent = await reporter.renderTestReportContent();
        expect(reportContent).toBeDefined();
        expect(
          reportContent
            ?.toString()
            .indexOf(
              '<div class="suite-consolelog"><div class="suite-consolelog-header">Console Log</div><div class="suite-consolelog-item"><pre class="suite-consolelog-item-origin">origin</pre><pre class="suite-consolelog-item-message">This is a console log</pre>'
            )
        ).toBeGreaterThan(-1);
      });

      it("should not add any console.logs to the report if includeConsoleLog is false", async () => {
        const reporter = new HTMLReporter({
          testData: mockAggregatedResultSingle,
          options: {},
          consoleLogs: [
            {
              filePath: mockAggregatedResultSingle.testResults[0].testFilePath,
              logs: [
                {
                  message: "This is a console log",
                  origin: "origin",
                  type: "log",
                },
              ],
            },
          ],
        });
        const reportContent = await reporter.renderTestReportContent();
        expect(reportContent).toBeDefined();
        expect(
          reportContent
            ?.toString()
            .indexOf(
              '<div class="suite-consolelog"><div class="suite-consolelog-header">Console Log</div><div class="suite-consolelog-item"><pre class="suite-consolelog-item-origin">origin</pre><pre class="suite-consolelog-item-message">This is a console log</pre>'
            )
        ).toBe(-1);
      });
    });

    describe("statusIgnoreFilter", () => {
      it("should remove tests with the specified status", async () => {
        const reporter = new HTMLReporter({
          testData: mockAggregatedResultMultiple,
          options: {
            statusIgnoreFilter: "passed",
          },
        });
        const reportContent = await reporter.renderTestReportContent();
        expect(reportContent).toBeDefined();
        expect(reportContent?.toString().indexOf('<tr class="passed">')).toBe(
          -1
        );
      });
    });

    describe("includeFailureMsg", () => {
      it("should include failure messages", async () => {
        const reporter = new HTMLReporter({
          testData: mockAggregatedResultMultiple,
          options: {
            includeFailureMsg: true,
          },
        });
        const reportContent = await reporter.renderTestReportContent();
        expect(reportContent).toBeDefined();
        expect(
          reportContent?.toString().indexOf('<div class="failureMessages">')
        ).toBeGreaterThan(-1);
      });
    });

    describe("includeStackTrace", () => {
      it("should remove stack traces in failure messages if set to false", async () => {
        const reporter = new HTMLReporter({
          testData: mockAggregatedResultSingle,
          options: {
            includeFailureMsg: true,
            includeStackTrace: false,
          },
        });
        const reportContent = await reporter.renderTestReportContent();
        expect(reportContent).toBeDefined();
        expect(
          reportContent
            ?.toString()
            .indexOf(
              '<pre class="failureMsg">Error: failures that happened</pre>'
            )
        ).not.toBe(-1);
      });
      it("should keep stack trace in failure messages if set to true", async () => {
        const reporter = new HTMLReporter({
          testData: mockAggregatedResultSingle,
          options: {
            includeFailureMsg: true,
            includeStackTrace: true,
          },
        });
        const reportContent = await reporter.renderTestReportContent();
        expect(reportContent).toBeDefined();
        expect(
          reportContent?.toString().indexOf("at stack trace")
        ).toBeGreaterThan(-1);
      });
      it("should keep stack trace in failure messages if undefined", async () => {
        const reporter = new HTMLReporter({
          testData: mockAggregatedResultSingle,
          options: {
            includeFailureMsg: true,
          },
        });
        const reportContent = await reporter.renderTestReportContent();
        expect(reportContent).toBeDefined();
        expect(
          reportContent?.toString().indexOf("at stack trace")
        ).toBeGreaterThan(-1);
      });
    });

    describe("includeSuiteFailure", () => {
      it("should include suite failure message", async () => {
        const reporter = new HTMLReporter({
          testData: mockAggregatedResultMultiple,
          options: {
            includeSuiteFailure: true,
          },
        });
        const reportContent = await reporter.renderTestReportContent();
        expect(reportContent).toBeDefined();
        expect(
          reportContent
            ?.toString()
            .indexOf('<div class="failureMessages suiteFailure">')
        ).toBeGreaterThan(-1);
      });
    });

    describe("includeObsoleteSnapshots", () => {
      it("should include obsolete snapshots", async () => {
        const reporter = new HTMLReporter({
          testData: mockAggregatedResultMultiple,
          options: {
            includeObsoleteSnapshots: true,
          },
        });
        const reportContent = await reporter.renderTestReportContent();
        expect(reportContent).toBeDefined();
        expect(
          reportContent
            ?.toString()
            .indexOf('<div class="summary-obsolete-snapshots">')
        ).toBeGreaterThan(-1);
        expect(
          reportContent
            ?.toString()
            .indexOf('<div class="suite-obsolete-snapshots">')
        ).toBeGreaterThan(-1);
      });
    });

    describe("logo", () => {
      it("should add a logo to the report", async () => {
        const reporter = new HTMLReporter({
          testData: mockAggregatedResultSingle,
          options: {
            logo: "logo.png",
          },
        });
        const reportContent = await reporter.renderTestReportContent();

        expect(
          reportContent?.toString().indexOf('<img id="logo" src="logo.png"/>')
        ).toBeGreaterThan(-1);
      });
    });

    describe("customScriptPath", () => {
      it("should add assigned custom script path to the report", async () => {
        const reporter = new HTMLReporter({
          testData: mockAggregatedResultSingle,
          options: {
            customScriptPath: "path/to/script.js",
          },
        });
        const report = await reporter.renderTestReport();

        expect(
          report.fullHtml.indexOf('<script src="path/to/script.js"></script>')
        ).toBeGreaterThan(-1);
      });
    });

    describe("pageTitle", () => {
      it("should add the given string as a title tag", async () => {
        const reporter = new HTMLReporter({
          testData: mockAggregatedResultSingle,
          options: {
            pageTitle: "My Report",
          },
        });
        const report = await reporter.renderTestReport();

        expect(
          report.fullHtml.indexOf('<h1 id="title">My Report</h1>')
        ).toBeGreaterThan(-1);
        expect(
          report.fullHtml.indexOf("<title>My Report</title>")
        ).toBeGreaterThan(-1);
      });
    });

    describe("executionTimeWarningThreshold", () => {
      it("should mark tests that have surpassed the threshold", async () => {
        const reporter = new HTMLReporter({
          testData: mockAggregatedResultSingle,
          options: {
            executionTimeWarningThreshold: 0.00001,
          },
        });
        const report = await reporter.renderTestReport();

        expect(
          report.fullHtml.indexOf('<div class="suite-time warn">')
        ).toBeGreaterThan(-1);
      });
    });

    describe("dateFormat", () => {
      it("should format the date in the given format", async () => {
        const reporter = new HTMLReporter({
          testData: mockAggregatedResultSingle,
          options: {
            dateFormat: "yyyy",
          },
        });
        const report = await reporter.renderTestReport();

        expect(
          report.fullHtml.indexOf(`<div id="timestamp">Started: 2020</div>`)
        ).toBeGreaterThan(-1);
      });
    });
  });

  describe("collapseSuitesByDefault", () => {
    it("should show the contents of test suites by default", async () => {
      const reporter = new HTMLReporter({
        testData: mockAggregatedResultSingle,
        options: {},
      });
      const report = await reporter.renderTestReport();
      expect(
        report.fullHtml.indexOf('class="toggle" checked="checked"')
      ).toBeGreaterThan(-1);
    });

    it("should hide the contents of test suites", async () => {
      const reporter = new HTMLReporter({
        testData: mockAggregatedResultSingle,
        options: {
          collapseSuitesByDefault: true,
        },
      });
      const report = await reporter.renderTestReport();
      expect(report.fullHtml.indexOf('class="toggle" checked="checked"')).toBe(
        -1
      );
    });
  });
});
