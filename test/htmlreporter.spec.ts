import fs from "fs";
import path from "path";

import HTMLReporter from "../src/htmlreporter";
import {
  mockedJestResponseMultipleTestResult,
  mockedJestResponseSingleTestResult,
  mockedSingleTestResultReportHTML
} from "./mockdata";

describe("HTMLReporter", () => {
  describe("generate", () => {
    it("should be able to generate a HTML report", async () => {
      const mockedFS = jest.spyOn(fs, "writeFileSync");
      mockedFS.mockImplementation();

      const reporter = new HTMLReporter(mockedJestResponseSingleTestResult, {});
      const report = await reporter.generate();

      expect(report.toString().substring(0, 6)).toEqual("<html>");

      mockedFS.mockRestore();
    });
  });

  describe("renderTestReportBody", () => {
    it("should return a HTML report body", async () => {
      const reporter = new HTMLReporter(mockedJestResponseSingleTestResult, {});
      const reportBody = await reporter.renderTestReportBody();
      expect(reportBody.toString()).toEqual(mockedSingleTestResultReportHTML);
    });

    it("should cast an error if no test data was provided", async () => {
      expect.assertions(1);
      // @ts-ignore
      const reporter = new HTMLReporter({}, {});
      expect(await reporter.renderTestReportBody()).toBeUndefined();
    });
  });

  describe("getConfigValue", () => {
    it("should return configured environment variable", async () => {
      process.env.JEST_HTML_REPORTER_LOGO = "logoFromEnv.png";
      const reporter = new HTMLReporter(mockedJestResponseSingleTestResult, {});
      const reportBody = (await reporter.renderTestReportBody()).toString();

      expect(
        reportBody.indexOf('<img id="logo" src="logoFromEnv.png"/>')
      ).toBeGreaterThan(-1);
      delete process.env.JEST_HTML_REPORTER_LOGO;
    });
  });

  describe("config options", () => {
    describe("boilerplate", () => {
      it("should insert the test report HTML into the given file", async () => {
        const mockedFS = jest.spyOn(fs, "readFileSync");
        mockedFS.mockImplementation(
          () => `<div>{jesthtmlreporter-content}</div>`
        );
        const reporter = new HTMLReporter(mockedJestResponseSingleTestResult, {
          boilerplate: path.join(process.cwd(), "/path/to/boilerplate.html")
        });

        const report = await reporter.renderTestReport();
        expect(report).toEqual(
          `<div>${mockedSingleTestResultReportHTML}</div>`
        );
        mockedFS.mockRestore();
      });
    });

    describe("styleOverridePath", () => {
      it("should insert a link to the overriding stylesheet path", async () => {
        const reporter = new HTMLReporter(mockedJestResponseSingleTestResult, {
          styleOverridePath: "path/to/style.css"
        });
        const report = await reporter.renderTestReport();
        expect(
          report
            .toString()
            .indexOf(
              '<link rel="stylesheet" type="text/css" href="path/to/style.css"/>'
            ) !== -1
        ).toBeTruthy();
      });
    });

    describe("includeConsoleLog", () => {
      it("should add found console.logs to the report if includeConsoleLog is set", async () => {
        const reporter = new HTMLReporter(
          mockedJestResponseSingleTestResult,
          {
            includeConsoleLog: true
          },
          [
            {
              filePath:
                mockedJestResponseSingleTestResult.testResults[0].testFilePath,
              logs: [
                {
                  message: "This is a console log",
                  origin: "origin",
                  type: "log"
                }
              ]
            }
          ]
        );
        const reportBody = (await reporter.renderTestReportBody()).toString();
        expect(
          reportBody.indexOf(
            '<div class="suite-consolelog"><div class="suite-consolelog-header">Console Log</div><div class="suite-consolelog-item"><pre class="suite-consolelog-item-origin">origin</pre><pre class="suite-consolelog-item-message">This is a console log</pre>'
          )
        ).toBeGreaterThan(-1);
      });

      it("should not add any console.logs to the report if includeConsoleLog is false", async () => {
        const reporter = new HTMLReporter(
          mockedJestResponseSingleTestResult,
          {},
          [
            {
              filePath:
                mockedJestResponseSingleTestResult.testResults[0].testFilePath,
              logs: [
                {
                  message: "This is a console log",
                  origin: "origin",
                  type: "log"
                }
              ]
            }
          ]
        );
        const reportBody = (await reporter.renderTestReportBody()).toString();
        expect(
          reportBody.indexOf(
            '<div class="suite-consolelog"><div class="suite-consolelog-header">Console Log</div><div class="suite-consolelog-item"><pre class="suite-consolelog-item-origin">origin</pre><pre class="suite-consolelog-item-message">This is a console log</pre>'
          )
        ).toBe(-1);
      });
    });

    describe("statusIgnoreFilter", () => {
      it("should remove tests with the specified status", async () => {
        const reporter = new HTMLReporter(
          mockedJestResponseMultipleTestResult,
          {
            statusIgnoreFilter: "passed"
          }
        );
        const reportBody = (await reporter.renderTestReportBody()).toString();

        expect(reportBody.indexOf('<tr class="passed">')).toBe(-1);
      });
    });

    describe("includeFailureMsg", () => {
      it("should include failure messages", async () => {
        const reporter = new HTMLReporter(
          mockedJestResponseMultipleTestResult,
          {
            includeFailureMsg: true
          }
        );
        const reportBody = (await reporter.renderTestReportBody()).toString();

        expect(
          reportBody.indexOf('<div class="failureMessages">')
        ).toBeGreaterThan(-1);
      });
    });

    describe("logo", () => {
      it("should add a logo to the report", async () => {
        const reporter = new HTMLReporter(mockedJestResponseSingleTestResult, {
          logo: "logo.png"
        });
        const reportBody = (await reporter.renderTestReportBody()).toString();

        expect(
          reportBody.indexOf('<img id="logo" src="logo.png"/>')
        ).toBeGreaterThan(-1);
      });
    });
  });
});
