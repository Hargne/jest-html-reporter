import sorting from "../src/sorting";
import { mockedJestResponseMultipleTestResult } from "./mockdata";

describe("sorting", () => {
  it("should have no effect when sort not configured", () => {
    const { testResults } = mockedJestResponseMultipleTestResult;
    const sortedTestResults = sorting(testResults);

    expect(sortedTestResults.length).toEqual(testResults.length);

    testResults.forEach((testResult, index) => {
      expect(sortedTestResults[index].testFilePath).toEqual(
        testResult.testFilePath
      );
    });
  });

  describe("byStatus", () => {
    /**
     * The pending and failed sections' sorting should match the passed section's sorting to make tests easier to find.
     * See ./mockdata/jestResponse.mock.js for test data
     * --
     * Expected results for "status" are:
     * 	pending from index-b
     * 	pending from index-c
     * 	failed from index-b
     * 	failed from index-c
     * 	passed from index-a
     * 	passed from index-b
     * 	passed from index-c
     * --
     * Meaning that the results are now broken into three sections:
     * 	1. pending
     * 	2. failed
     * 	3. passed
     */
    it("should order results as 1.pending 2.failed 3.passed", () => {
      const { testResults } = mockedJestResponseMultipleTestResult;
      const sortedTestResults = sorting(testResults, "status");

      // Pending
      expect(sortedTestResults[0].testResults.length).toEqual(1);
      expect(sortedTestResults[0].numPendingTests).toEqual(1);
      expect(sortedTestResults[0].testFilePath).toEqual("index-b.js");

      expect(sortedTestResults[1].testResults.length).toEqual(1);
      expect(sortedTestResults[1].numPendingTests).toEqual(1);
      expect(sortedTestResults[1].testFilePath).toEqual("index-c.js");

      // Failed
      expect(sortedTestResults[2].testResults.length).toEqual(1);
      expect(sortedTestResults[2].numFailingTests).toEqual(1);
      expect(sortedTestResults[2].testFilePath).toEqual("index-b.js");

      expect(sortedTestResults[3].testResults.length).toEqual(1);
      expect(sortedTestResults[3].numFailingTests).toEqual(1);
      expect(sortedTestResults[3].testFilePath).toEqual("index-c.js");

      // Passed
      expect(sortedTestResults[4].testResults.length).toEqual(3);
      expect(sortedTestResults[4].numPassingTests).toEqual(3);
      expect(sortedTestResults[4].testFilePath).toEqual("index-a.js");

      expect(sortedTestResults[5].testResults.length).toEqual(1);
      expect(sortedTestResults[5].numPassingTests).toEqual(1);
      expect(sortedTestResults[5].testFilePath).toEqual("index-b.js");

      expect(sortedTestResults[6].testResults.length).toEqual(1);
      expect(sortedTestResults[6].numPassingTests).toEqual(1);
      expect(sortedTestResults[6].testFilePath).toEqual("index-c.js");
    });

    it("should sort all passed tests as default", () => {
      const { testResults } = mockedJestResponseMultipleTestResult;
      const sortedTestResults = sorting(testResults, "status");

      // Skipping the pending and failed sections of the output, the remainder should match.
      // Currently the test data has two suites that each have one failed and one pending test - therefore skip 4
      expect(sortedTestResults[4].testFilePath).toEqual(
        testResults[0].testFilePath
      );
      expect(sortedTestResults[5].testFilePath).toEqual(
        testResults[1].testFilePath
      );
      expect(sortedTestResults[6].testFilePath).toEqual(
        testResults[2].testFilePath
      );
    });
  });

  describe("sortByExecutionDesc", () => {
    it("should order the test data by execution time", () => {
      const { testResults } = mockedJestResponseMultipleTestResult;
      const sortedTestResults = sorting(testResults, "executiondesc");

      expect(sortedTestResults[0].testFilePath).toEqual("index-c.js");
      expect(sortedTestResults[1].testFilePath).toEqual("index-a.js");
      expect(sortedTestResults[2].testFilePath).toEqual("index-b.js");
    });
  });

  describe("byExecutionAsc", () => {
    it("should order the test data by execution time", () => {
      const { testResults } = mockedJestResponseMultipleTestResult;
      const sortedTestResults = sorting(testResults, "executionasc");

      expect(sortedTestResults[0].testFilePath).toEqual("index-b.js");
      expect(sortedTestResults[1].testFilePath).toEqual("index-a.js");
      expect(sortedTestResults[2].testFilePath).toEqual("index-c.js");
    });
  });

  describe("byTitleDesc", () => {
    it("should order the test data by name", () => {
      const { testResults } = mockedJestResponseMultipleTestResult;
      const sortedTestResults = sorting(testResults, "titledesc");

      expect(sortedTestResults[0].testFilePath).toEqual("index-c.js");
      expect(sortedTestResults[0].testResults[0].ancestorTitles[0]).toEqual(
        "ancestor c"
      );
      expect(sortedTestResults[0].testResults[1].ancestorTitles[0]).toEqual(
        "ancestor b"
      );
      expect(sortedTestResults[0].testResults[2].ancestorTitles[0]).toEqual(
        "ancestor a"
      );

      expect(sortedTestResults[1].testFilePath).toEqual("index-b.js");
      expect(sortedTestResults[1].testResults[0].ancestorTitles[0]).toEqual(
        "ancestor c"
      );
      expect(sortedTestResults[1].testResults[1].ancestorTitles[0]).toEqual(
        "ancestor b"
      );
      expect(sortedTestResults[1].testResults[2].ancestorTitles[0]).toEqual(
        "ancestor a"
      );

      expect(sortedTestResults[2].testFilePath).toEqual("index-a.js");
      expect(sortedTestResults[2].testResults[0].ancestorTitles[0]).toEqual(
        "ancestor c"
      );
      expect(sortedTestResults[2].testResults[1].ancestorTitles[0]).toEqual(
        "ancestor b"
      );
      expect(sortedTestResults[2].testResults[2].ancestorTitles[0]).toEqual(
        "ancestor a"
      );
    });
  });

  describe("byTitleAsc", () => {
    it("should order the test data by name", () => {
      const { testResults } = mockedJestResponseMultipleTestResult;
      const sortedTestResults = sorting(testResults, "titleasc");

      expect(sortedTestResults[0].testFilePath).toEqual("index-a.js");
      expect(sortedTestResults[0].testResults[0].ancestorTitles[0]).toEqual(
        "ancestor a"
      );
      expect(sortedTestResults[0].testResults[1].ancestorTitles[0]).toEqual(
        "ancestor b"
      );
      expect(sortedTestResults[0].testResults[2].ancestorTitles[0]).toEqual(
        "ancestor c"
      );

      expect(sortedTestResults[1].testFilePath).toEqual("index-b.js");
      expect(sortedTestResults[1].testResults[0].ancestorTitles[0]).toEqual(
        "ancestor a"
      );
      expect(sortedTestResults[1].testResults[1].ancestorTitles[0]).toEqual(
        "ancestor b"
      );
      expect(sortedTestResults[1].testResults[2].ancestorTitles[0]).toEqual(
        "ancestor c"
      );

      expect(sortedTestResults[2].testFilePath).toEqual("index-c.js");
      expect(sortedTestResults[2].testResults[0].ancestorTitles[0]).toEqual(
        "ancestor a"
      );
      expect(sortedTestResults[2].testResults[1].ancestorTitles[0]).toEqual(
        "ancestor b"
      );
      expect(sortedTestResults[2].testResults[2].ancestorTitles[0]).toEqual(
        "ancestor c"
      );
    });
  });
});
