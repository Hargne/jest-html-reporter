import fs from "fs";

import HTMLReporter from "./htmlreporter";
import mockAggregatedResultSingle from "./__mock__/mockAggregatedResultSingle";
import mockAggregatedResultMultiple from "./__mock__/mockAggregatedResultMultiple";
import { JestHTMLReporterProps } from "./types";

describe("HTMLReporter", () => {
  afterEach(() => {
    // Make sure to clear the document after each test
    document.body.innerHTML = "";
  });

  async function renderReportToDOM(props?: Partial<JestHTMLReporterProps>) {
    const reporter = new HTMLReporter({
      testData: props?.testData ?? mockAggregatedResultSingle,
      options: props?.options ?? {},
      ...props,
    });
    const report = await reporter.renderTestReport();
    document.body.innerHTML = report.fullHtml;
  }

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

      await renderReportToDOM();

      expect(document.querySelector("img#logo")?.getAttribute("src")).toEqual(
        "logoFromEnv.png"
      );

      delete process.env.JEST_HTML_REPORTER_LOGO;
    });
  });

  describe("config options", () => {
    describe("styleOverridePath", () => {
      it("should insert a link to the overriding stylesheet path", async () => {
        await renderReportToDOM({
          options: {
            styleOverridePath: "path/to/style.css",
          },
        });

        expect(
          document.querySelector('link[href="path/to/style.css"]')
        ).toBeDefined();
      });
    });

    describe("includeConsoleLog", () => {
      it("should add found console.logs to the report if includeConsoleLog is set", async () => {
        await renderReportToDOM({
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

        expect(document.querySelectorAll(".suite-consolelog").length).toEqual(
          1
        );
      });

      it("should not add any console.logs to the report if includeConsoleLog is false", async () => {
        await renderReportToDOM({
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

        expect(document.querySelectorAll(".suite-consolelog").length).toEqual(
          0
        );
      });
    });

    describe("statusIgnoreFilter", () => {
      it("should remove tests with the specified status", async () => {
        await renderReportToDOM({
          testData: mockAggregatedResultMultiple,
          options: {
            statusIgnoreFilter: "passed",
          },
        });

        expect(document.querySelectorAll(".passed").length).toEqual(0);
      });
    });

    describe("includeFailureMsg", () => {
      it("should include failure messages", async () => {
        await renderReportToDOM({
          testData: mockAggregatedResultMultiple,
          options: {
            includeFailureMsg: true,
          },
        });

        const failuresInTestData = mockAggregatedResultMultiple.testResults
          .flatMap((test) => test.testResults)
          .reduce((total, result) => total + result.failureMessages.length, 0);

        expect(document.querySelectorAll(".failureMsg").length).toEqual(
          failuresInTestData
        );
      });
    });

    describe("includeStackTrace", () => {
      it("should remove stack traces in failure messages if set to false", async () => {
        await renderReportToDOM({
          testData: mockAggregatedResultMultiple,
          options: {
            includeFailureMsg: true,
            includeStackTrace: false,
          },
        });

        expect(
          document.querySelector("pre.failureMsg")?.textContent
        ).not.toContain("at stack trace");
      });
      it("should keep stack trace in failure messages if set to true", async () => {
        await renderReportToDOM({
          testData: mockAggregatedResultMultiple,
          options: {
            includeFailureMsg: true,
            includeStackTrace: true,
          },
        });

        expect(document.querySelector("pre.failureMsg")?.textContent).toContain(
          "at stack trace"
        );
      });
      it("should keep stack trace in failure messages if undefined", async () => {
        await renderReportToDOM({
          testData: mockAggregatedResultMultiple,
          options: {
            includeFailureMsg: true,
          },
        });

        expect(document.querySelector("pre.failureMsg")?.textContent).toContain(
          "at stack trace"
        );
      });
    });

    describe("includeSuiteFailure", () => {
      it("should include suite failure message", async () => {
        await renderReportToDOM({
          testData: mockAggregatedResultMultiple,
          options: {
            includeSuiteFailure: true,
          },
        });

        const suiteFailuresInTestData =
          mockAggregatedResultMultiple.testResults.reduce(
            (prev, curr) => prev + (curr.failureMessage ? 1 : 0),
            0
          );

        expect(document.querySelectorAll(".suiteFailure").length).toEqual(
          suiteFailuresInTestData
        );
      });
    });

    describe("includeObsoleteSnapshots", () => {
      it("should include obsolete snapshots", async () => {
        await renderReportToDOM({
          testData: mockAggregatedResultMultiple,
          options: {
            includeObsoleteSnapshots: true,
          },
        });

        // Ensure that the obsolete snapshots exist in the report
        const obsoleteSnapshotsInTestData =
          mockAggregatedResultMultiple.testResults.reduce(
            (prev, curr) => prev + curr.snapshot.unchecked,
            0
          );

        expect(
          document.querySelector(".summary-obsolete-snapshots")?.textContent
        ).toEqual(`${obsoleteSnapshotsInTestData} obsolete snapshots`);
      });
    });

    describe("logo", () => {
      it("should add a logo to the report", async () => {
        await renderReportToDOM({
          options: {
            logo: "logo.png",
          },
        });

        expect(document.querySelector("img#logo")?.getAttribute("src")).toEqual(
          "logo.png"
        );
      });
    });

    describe("customScriptPath", () => {
      it("should add assigned custom script path to the report", async () => {
        await renderReportToDOM({
          options: {
            customScriptPath: "path/to/script.js",
          },
        });

        expect(
          document.querySelector('script[src="path/to/script.js"]')
        ).toBeDefined();
      });
    });

    describe("pageTitle", () => {
      it("should render the string in the document's title tag and as the h1", async () => {
        await renderReportToDOM({
          options: {
            pageTitle: "My Report",
          },
        });

        // Look for a meta tag with the title
        expect(document.querySelector("title")?.textContent).toEqual(
          "My Report"
        );
        // Look for a heading with the title
        expect(document.querySelector("h1")?.textContent).toEqual("My Report");
      });
    });

    describe("executionTimeWarningThreshold", () => {
      it("should mark tests that have surpassed the threshold", async () => {
        await renderReportToDOM({
          options: {
            executionTimeWarningThreshold: 0.00001,
          },
        });

        // Look for at least one execution time warning
        expect(
          document.querySelectorAll(".suite-time.warn").length
        ).toBeGreaterThan(-1);
      });
    });

    describe("dateFormat", () => {
      it("should format the date in the given format", async () => {
        await renderReportToDOM({
          options: {
            dateFormat: "yyyy",
          },
        });

        expect(document.querySelector("#timestamp")?.textContent).toEqual(
          "Started: 2020"
        );
      });
    });
  });

  describe("collapseSuitesByDefault", () => {
    it("should show the contents of test suites by default", async () => {
      await renderReportToDOM();

      // Check that each <details> element has the "open" attribute
      const detailsElements = document.querySelectorAll(
        "details.suite-container"
      );
      detailsElements.forEach((el) => {
        expect(el.hasAttribute("open")).toBe(true);
      });
    });

    it("should hide the contents of test suites", async () => {
      await renderReportToDOM({
        options: {
          collapseSuitesByDefault: true,
        },
      });

      // Check that each <details> element does not have the "open" attribute
      const detailsElements = document.querySelectorAll(
        "details.suite-container"
      );
      detailsElements.forEach((el) => {
        expect(el.hasAttribute("open")).toBe(false);
      });
    });
  });
});
