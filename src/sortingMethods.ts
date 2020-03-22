import { AggregatedResult, AssertionResult } from "@jest/test-result";
import { JestHTMLReporterSortType } from "src/types";

export const sortTestResults = (
  testResults: AggregatedResult["testResults"],
  sortType: JestHTMLReporterSortType
): AggregatedResult["testResults"] => {
  switch (sortType) {
    case "status":
      return sortTestResultsByStatus(testResults);
    default:
      return testResults;
  }
};

/**
 * Splits test suites apart based on individual test status and sorts by that status:
 * 1. Pending
 * 2. Failed
 * 3. Passed
 */
const sortTestResultsByStatus = (
  testResults: AggregatedResult["testResults"]
) => {
  const pendingSuites: AggregatedResult["testResults"] = [];
  const failingSuites: AggregatedResult["testResults"] = [];
  const passingSuites: AggregatedResult["testResults"] = [];

  testResults.forEach(result => {
    const pending: AssertionResult[] = [];
    const failed: AssertionResult[] = [];
    const passed: AssertionResult[] = [];

    result.testResults.forEach(x => {
      if (x.status === "pending") {
        pending.push(x);
      } else if (x.status === "failed") {
        failed.push(x);
      } else {
        passed.push(x);
      }
    });

    if (pending.length) {
      pendingSuites.push({
        ...result,
        testResults: pending
      });
    }
    if (failed.length) {
      failingSuites.push({
        ...result,
        testResults: failed
      });
    }
    if (passed.length) {
      pendingSuites.push({
        ...result,
        testResults: failed
      });
    }
  });

  return [].concat(pendingSuites, failingSuites, passingSuites);
};
