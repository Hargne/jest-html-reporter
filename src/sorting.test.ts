import sorting from "./sorting";
import mockAggregatedResultMultiple from "./__mock__/mockAggregatedResultMultiple";

describe("sorting", () => {
  it("should have no effect when sort not configured", () => {
    const { testResults } = mockAggregatedResultMultiple;
    const sortedTestResults = sorting(testResults);

    expect(sortedTestResults.length).toEqual(testResults.length);

    testResults.forEach((testResult, index) => {
      expect(sortedTestResults[index].testFilePath).toEqual(
        testResult.testFilePath,
      );
    });
  });

  it("should have no effect when an invalid sort option is given", () => {
    const { testResults } = mockAggregatedResultMultiple;
    const sortedTestResults = sorting(testResults, "invalid");

    expect(sortedTestResults.length).toEqual(testResults.length);

    testResults.forEach((testResult, index) => {
      expect(sortedTestResults[index].testFilePath).toEqual(
        testResult.testFilePath,
      );
    });
  });

  describe("status", () => {
    /**
     * The pending and failed sections' sorting should match the passed section's sorting to make tests easier to find.
     * --
     * Expected results for "status" are:
     * 	pending from test2-pending-failed-passed
     * 	pending from test3-pending-failed-passed-todo
     * 	failed from test2-pending-failed-passed
     * 	failed from test3-pending-failed-passed-todo
     * 	passed from test1-passed
     * 	passed from test2-pending-failed-passed
     * 	passed from test3-pending-failed-passed-todo
     * --
     * Meaning that the results are now broken into three sections:
     * 	1. pending
     * 	2. failed
     * 	3. passed
     */
    it("should order results by default as 1.pending 2.failed 3.passed", () => {
      const { testResults } = mockAggregatedResultMultiple;
      const sortedTestResults = sorting(testResults, "status");

      const expectedResults = [
        {
          status: "pending",
          numTestsKey: "numPendingTests",
          file: "test2-pending-failed-passed.js",
          count: 1,
        },
        {
          status: "pending",
          numTestsKey: "numPendingTests",
          file: "test3-pending-failed-passed-todo.js",
          count: 1,
        },
        {
          status: "failed",
          numTestsKey: "numFailingTests",
          file: "test2-pending-failed-passed.js",
          count: 1,
        },
        {
          status: "failed",
          numTestsKey: "numFailingTests",
          file: "test3-pending-failed-passed-todo.js",
          count: 1,
        },
        {
          status: "passed",
          numTestsKey: "numPassingTests",
          file: "test1-passed.js",
          count: 3,
        },
        {
          status: "passed",
          numTestsKey: "numPassingTests",
          file: "test2-pending-failed-passed.js",
          count: 1,
        },
        {
          status: "passed",
          numTestsKey: "numPassingTests",
          file: "test3-pending-failed-passed-todo.js",
          count: 1,
        },
      ];

      expectedResults.forEach(({ numTestsKey, file, count }, index) => {
        const result = sortedTestResults[index];
        expect(result.testResults.length).toEqual(count);
        expect(result[numTestsKey as keyof typeof result]).toEqual(count);
        expect(result.testFilePath).toEqual(file);
      });
    });

    it("should when provided with all statuses in a given order sort results accordingly", () => {
      const { testResults } = mockAggregatedResultMultiple;
      const sortedTestResults = sorting(
        testResults,
        "status:failed,passed,pending",
      );

      const expectedResults = [
        {
          status: "failed",
          numTestsKey: "numFailingTests",
          file: "test2-pending-failed-passed.js",
          count: 1,
        },
        {
          status: "failed",
          numTestsKey: "numFailingTests",
          file: "test3-pending-failed-passed-todo.js",
          count: 1,
        },
        {
          status: "passed",
          numTestsKey: "numPassingTests",
          file: "test1-passed.js",
          count: 3,
        },
        {
          status: "passed",
          numTestsKey: "numPassingTests",
          file: "test2-pending-failed-passed.js",
          count: 1,
        },
        {
          status: "passed",
          numTestsKey: "numPassingTests",
          file: "test3-pending-failed-passed-todo.js",
          count: 1,
        },
        {
          status: "pending",
          numTestsKey: "numPendingTests",
          file: "test2-pending-failed-passed.js",
          count: 1,
        },
        {
          status: "pending",
          numTestsKey: "numPendingTests",
          file: "test3-pending-failed-passed-todo.js",
          count: 1,
        },
      ];

      expectedResults.forEach(({ numTestsKey, file, count }, index) => {
        const result = sortedTestResults[index];
        expect(result.testResults.length).toEqual(count);
        expect(result[numTestsKey as keyof typeof result]).toEqual(count);
        expect(result.testFilePath).toEqual(file);
      });
    });

    it("should when provided with a single status order the results starting with that status and then continue as default", () => {
      const { testResults } = mockAggregatedResultMultiple;
      const sortedTestResults = sorting(testResults, "status:passed");

      const expectedResults = [
        {
          status: "passed",
          numTestsKey: "numPassingTests",
          file: "test1-passed.js",
          count: 3,
        },
        {
          status: "passed",
          numTestsKey: "numPassingTests",
          file: "test2-pending-failed-passed.js",
          count: 1,
        },
        {
          status: "passed",
          numTestsKey: "numPassingTests",
          file: "test3-pending-failed-passed-todo.js",
          count: 1,
        },
        {
          status: "pending",
          numTestsKey: "numPendingTests",
          file: "test2-pending-failed-passed.js",
          count: 1,
        },
        {
          status: "pending",
          numTestsKey: "numPendingTests",
          file: "test3-pending-failed-passed-todo.js",
          count: 1,
        },
        {
          status: "failed",
          numTestsKey: "numFailingTests",
          file: "test2-pending-failed-passed.js",
          count: 1,
        },
        {
          status: "failed",
          numTestsKey: "numFailingTests",
          file: "test3-pending-failed-passed-todo.js",
          count: 1,
        },
      ];

      expectedResults.forEach(({ numTestsKey, file, count }, index) => {
        const result = sortedTestResults[index];
        expect(result.testFilePath).toEqual(file);
        expect(result.testResults.length).toEqual(count);
        expect(result[numTestsKey as keyof typeof result]).toEqual(count);
      });
    });
  });

  describe("executiondesc", () => {
    it("should order the test data by execution time", () => {
      const { testResults } = mockAggregatedResultMultiple;
      const sortedTestResults = sorting(testResults, "executiondesc");

      expect(sortedTestResults[0].testFilePath).toEqual(
        "test3-pending-failed-passed-todo.js",
      );
      expect(sortedTestResults[1].testFilePath).toEqual("test1-passed.js");
      expect(sortedTestResults[2].testFilePath).toEqual(
        "test2-pending-failed-passed.js",
      );
    });
  });

  describe("executionasc", () => {
    it("should order the test data by execution time", () => {
      const { testResults } = mockAggregatedResultMultiple;
      const sortedTestResults = sorting(testResults, "executionasc");

      expect(sortedTestResults[0].testFilePath).toEqual("test4-empty.js");
      expect(sortedTestResults[1].testFilePath).toEqual(
        "test2-pending-failed-passed.js",
      );
      expect(sortedTestResults[2].testFilePath).toEqual("test1-passed.js");
      expect(sortedTestResults[3].testFilePath).toEqual(
        "test3-pending-failed-passed-todo.js",
      );
    });
  });

  describe("titledesc", () => {
    it("should order the test data by name", () => {
      const { testResults } = mockAggregatedResultMultiple;
      const sortedTestResults = sorting(testResults, "titledesc");

      expect(sortedTestResults[0].testFilePath).toEqual("test4-empty.js");

      expect(sortedTestResults[1].testFilePath).toEqual(
        "test3-pending-failed-passed-todo.js",
      );
      expect(sortedTestResults[1].testResults[0].ancestorTitles[0]).toEqual(
        "ancestor d",
      );
      expect(sortedTestResults[1].testResults[1].ancestorTitles[0]).toEqual(
        "ancestor c",
      );
      expect(sortedTestResults[1].testResults[2].ancestorTitles[0]).toEqual(
        "ancestor b",
      );
      expect(sortedTestResults[1].testResults[3].ancestorTitles[0]).toEqual(
        "ancestor a",
      );

      expect(sortedTestResults[2].testFilePath).toEqual(
        "test2-pending-failed-passed.js",
      );
      expect(sortedTestResults[2].testResults[0].ancestorTitles[0]).toEqual(
        "ancestor c",
      );
      expect(sortedTestResults[2].testResults[1].ancestorTitles[0]).toEqual(
        "ancestor b",
      );
      expect(sortedTestResults[2].testResults[2].ancestorTitles[0]).toEqual(
        "ancestor a",
      );

      expect(sortedTestResults[3].testFilePath).toEqual("test1-passed.js");
      expect(sortedTestResults[3].testResults[0].ancestorTitles[0]).toEqual(
        "ancestor c",
      );
      expect(sortedTestResults[3].testResults[1].ancestorTitles[0]).toEqual(
        "ancestor b",
      );
      expect(sortedTestResults[3].testResults[2].ancestorTitles[0]).toEqual(
        "ancestor a",
      );
    });
  });

  describe("titleasc", () => {
    it("should order the test data by name", () => {
      const { testResults } = mockAggregatedResultMultiple;
      const sortedTestResults = sorting(testResults, "titleasc");

      expect(sortedTestResults[0].testFilePath).toEqual("test1-passed.js");
      expect(sortedTestResults[0].testResults[0].ancestorTitles[0]).toEqual(
        "ancestor a",
      );
      expect(sortedTestResults[0].testResults[1].ancestorTitles[0]).toEqual(
        "ancestor b",
      );
      expect(sortedTestResults[0].testResults[2].ancestorTitles[0]).toEqual(
        "ancestor c",
      );

      expect(sortedTestResults[1].testFilePath).toEqual(
        "test2-pending-failed-passed.js",
      );
      expect(sortedTestResults[1].testResults[0].ancestorTitles[0]).toEqual(
        "ancestor a",
      );
      expect(sortedTestResults[1].testResults[1].ancestorTitles[0]).toEqual(
        "ancestor b",
      );
      expect(sortedTestResults[1].testResults[2].ancestorTitles[0]).toEqual(
        "ancestor c",
      );

      expect(sortedTestResults[2].testFilePath).toEqual(
        "test3-pending-failed-passed-todo.js",
      );
      expect(sortedTestResults[2].testResults[0].ancestorTitles[0]).toEqual(
        "ancestor a",
      );
      expect(sortedTestResults[2].testResults[1].ancestorTitles[0]).toEqual(
        "ancestor b",
      );
      expect(sortedTestResults[2].testResults[2].ancestorTitles[0]).toEqual(
        "ancestor c",
      );
    });
  });
});
