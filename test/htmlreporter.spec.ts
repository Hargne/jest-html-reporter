import fs from "fs";

import HTMLReporter from "../src/htmlreporter";
import {
  mockedJestResponseMultipleTestResult,
  mockedJestResponseSingleTestResult,
} from "./mockdata";

describe("HTMLReporter", () => {
  describe("generate", () => {
    it("should be able to generate a HTML report", async () => {
      const mockedFS = jest.spyOn(fs, "writeFileSync");
      mockedFS.mockImplementation();

      const reporter = new HTMLReporter(
        mockedJestResponseSingleTestResult,
        {},
        null
      );
      const report = await reporter.generate();

      expect(report.toString().substring(0, 6)).toEqual("<html>");
      mockedFS.mockRestore();
    });
  });

  describe("renderTestReportContent", () => {
    it("should cast an error if no test data was provided", async () => {
      expect.assertions(1);
      // @ts-ignore
      const reporter = new HTMLReporter({}, {});
      expect(await reporter.renderTestReportContent()).toBeUndefined();
    });
  });

  describe("getConfigValue", () => {
    it("should return configured environment variable", async () => {
      process.env.JEST_HTML_REPORTER_LOGO = "logoFromEnv.png";
      const reporter = new HTMLReporter(
        mockedJestResponseSingleTestResult,
        {},
        null
      );
      const reportContent = (
        await reporter.renderTestReportContent()
      ).toString();

      expect(
        reportContent.indexOf('<img id="logo" src="logoFromEnv.png"/>')
      ).toBeGreaterThan(-1);
      delete process.env.JEST_HTML_REPORTER_LOGO;
    });
  });

  describe("config options", () => {
    /* TODO: The following test runs locally, but fails in Travis CI
    describe("boilerplate", () => {
      it("should insert the test report HTML into the given file", async () => {
        const mockedFS = jest.spyOn(fs, "readFileSync");
        mockedFS.mockImplementation(
          () => "<div>{jesthtmlreporter-content}</div>"
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
    */

    describe("styleOverridePath", () => {
      it("should insert a link to the overriding stylesheet path", async () => {
        const reporter = new HTMLReporter(
          mockedJestResponseSingleTestResult,
          {
            styleOverridePath: "path/to/style.css",
          },
          null
        );
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
            includeConsoleLog: true,
          },
          null,
          [
            {
              filePath:
                mockedJestResponseSingleTestResult.testResults[0].testFilePath,
              logs: [
                {
                  message: "This is a console log",
                  origin: "origin",
                  type: "log",
                },
              ],
            },
          ]
        );
        const reportContent = (
          await reporter.renderTestReportContent()
        ).toString();
        expect(
          reportContent.indexOf(
            '<div class="suite-consolelog"><div class="suite-consolelog-header">Console Log</div><div class="suite-consolelog-item"><pre class="suite-consolelog-item-origin">origin</pre><pre class="suite-consolelog-item-message">This is a console log</pre>'
          )
        ).toBeGreaterThan(-1);
      });

      it("should not add any console.logs to the report if includeConsoleLog is false", async () => {
        const reporter = new HTMLReporter(
          mockedJestResponseSingleTestResult,
          {},
          null,
          [
            {
              filePath:
                mockedJestResponseSingleTestResult.testResults[0].testFilePath,
              logs: [
                {
                  message: "This is a console log",
                  origin: "origin",
                  type: "log",
                },
              ],
            },
          ]
        );
        const reportContent = (
          await reporter.renderTestReportContent()
        ).toString();
        expect(
          reportContent.indexOf(
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
            statusIgnoreFilter: "passed",
          },
          null
        );
        const reportContent = (
          await reporter.renderTestReportContent()
        ).toString();

        expect(reportContent.indexOf('<tr class="passed">')).toBe(-1);
      });
    });

    describe("includeFailureMsg", () => {
      it("should include failure messages", async () => {
        const reporter = new HTMLReporter(
          mockedJestResponseMultipleTestResult,
          {
            includeFailureMsg: true,
          },
          null
        );
        const reportContent = (
          await reporter.renderTestReportContent()
        ).toString();

        expect(
          reportContent.indexOf('<div class="failureMessages">')
        ).toBeGreaterThan(-1);
      });
    });

    describe("logo", () => {
      it("should add a logo to the report", async () => {
        const reporter = new HTMLReporter(
          mockedJestResponseSingleTestResult,
          {
            logo: "logo.png",
          },
          null
        );
        const reportContent = (
          await reporter.renderTestReportContent()
        ).toString();

        expect(
          reportContent.indexOf('<img id="logo" src="logo.png"/>')
        ).toBeGreaterThan(-1);
      });
    });

    describe("customScriptPath", () => {
      it("should add assigned custom script path to the report", async () => {
        const reporter = new HTMLReporter(
          mockedJestResponseSingleTestResult,
          {
            customScriptPath: "path/to/script.js",
          },
          null
        );
        const report = (await reporter.renderTestReport()).toString();

        expect(
          report.indexOf('<script src="path/to/script.js"></script>')
        ).toBeGreaterThan(-1);
      });
    });

    describe("pageTitle", () => {
      it("should add the given string as a title tag", async () => {
        const reporter = new HTMLReporter(
          mockedJestResponseSingleTestResult,
          {
            pageTitle: "My Report",
          },
          null
        );
        const report = (await reporter.renderTestReport()).toString();

        expect(report.indexOf('<h1 id="title">My Report</h1>')).toBeGreaterThan(
          -1
        );
      });

      it("should add the given string as a header", async () => {
        const reporter = new HTMLReporter(
          mockedJestResponseSingleTestResult,
          {
            pageTitle: "My Report",
          },
          null
        );
        const report = (await reporter.renderTestReport()).toString();

        expect(report.indexOf("<title>My Report</title>")).toBeGreaterThan(-1);
      });
    });

    describe("executionTimeWarningThreshold", () => {
      it("should mark tests that have surpassed the threshold", async () => {
        const reporter = new HTMLReporter(
          mockedJestResponseSingleTestResult,
          {
            executionTimeWarningThreshold: 0.00001,
          },
          null
        );
        const report = (await reporter.renderTestReport()).toString();

        expect(report.indexOf('<div class="suite-time warn">')).toBeGreaterThan(
          -1
        );
      });
    });

    describe("dateFormat", () => {
      it("should format the date in the given format", async () => {
        const reporter = new HTMLReporter(
          mockedJestResponseSingleTestResult,
          {
            dateFormat: "yyyy",
          },
          null
        );
        const report = (await reporter.renderTestReport()).toString();
        const now = new Date();

        expect(
          report.indexOf(
            `<div id="timestamp">Started: ${now.getFullYear()}</div>`
          )
        ).toBeGreaterThan(-1);
      });
    });
  });

  describe("setupConfig", () => {
    it("should return default value if no options were provided", async () => {
      const reporter = new HTMLReporter(
        mockedJestResponseSingleTestResult,
        null,
        null
      );
      expect(reporter.config).toBeDefined();
      expect(reporter.config.append.configValue).not.toBeDefined();
      expect(reporter.getConfigValue("append")).toEqual(false);
    });
  });

  describe("replaceRootDirInPath", () => {
    it("should replace <rootDir> in the given path", () => {
      const reporter = new HTMLReporter(
        mockedJestResponseSingleTestResult,
        {},
        null
      );
      const result = reporter.replaceRootDirInPath(
        "mockedRoot",
        "<rootDir>/test/reporter.html"
      );

      expect(result).toContain("mockedRoot");
      expect(result).not.toContain("<rootDir>");
    });

    it("should simply return the file path if no <rootDir> is present", () => {
      const reporter = new HTMLReporter(
        mockedJestResponseSingleTestResult,
        {},
        null
      );
      const result = reporter.replaceRootDirInPath(
        "mockedRoot",
        "test/reporter.html"
      );

      expect(result).toBe("test/reporter.html");
    });

    it("should be able to handle cases where root is not defined", () => {
      const reporter = new HTMLReporter(
        mockedJestResponseSingleTestResult,
        {},
        null
      );
      const result = reporter.replaceRootDirInPath(null, "test/reporter.html");

      expect(result).toBe("test/reporter.html");
    });
  });
});
