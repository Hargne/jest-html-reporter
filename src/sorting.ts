import { AggregatedResult, AssertionResult } from "@jest/test-result";
import { JestHTMLReporterSortType } from "src/types";

export default (
  testResults: AggregatedResult["testResults"],
  sortType?: JestHTMLReporterSortType
): AggregatedResult["testResults"] => {
  const sortTypeLowercase = sortType && sortType.toLowerCase();
  switch (sortTypeLowercase) {
    case "status":
      return sortByStatus(testResults);
    case "executiondesc":
      return sortByExecutionDesc(testResults);
    case "executionasc":
      return sortByExecutionAsc(testResults);
    case "titledesc":
      return sortByTitleDesc(testResults);
    case "titleasc":
      return sortByTitleAsc(testResults);
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
const sortByStatus = (testResults: AggregatedResult["testResults"]) => {
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

    if (pending.length > 0) {
      pendingSuites.push({
        ...result,
        testResults: pending
      });
    }
    if (failed.length > 0) {
      failingSuites.push({
        ...result,
        testResults: failed
      });
    }
    if (passed.length > 0) {
      passingSuites.push({
        ...result,
        testResults: passed
      });
    }
  });

  return [].concat(pendingSuites, failingSuites, passingSuites);
};

/**
 * Sorts by Execution Time | Descending
 */
const sortByExecutionDesc = (testResults: AggregatedResult["testResults"]) => {
  if (testResults) {
    testResults.sort(
      (a, b) =>
        b.perfStats.end -
        b.perfStats.start -
        (a.perfStats.end - a.perfStats.start)
    );
  }
  return testResults;
};

/**
 * Sorts by Execution Time | Ascending
 */
const sortByExecutionAsc = (testResults: AggregatedResult["testResults"]) => {
  if (testResults) {
    testResults.sort(
      (a, b) =>
        a.perfStats.end -
        a.perfStats.start -
        (b.perfStats.end - b.perfStats.start)
    );
  }
  return testResults;
};

/**
 * Sorts by Suite filename and Test name | Descending
 */
const sortByTitleDesc = (testResults: AggregatedResult["testResults"]) => {
  if (testResults) {
    // Sort Suites
    const sorted = testResults.sort((a, b) =>
      sortAlphabetically(a.testFilePath, b.testFilePath, true)
    );
    // Sort Suite testResults
    sorted.forEach(suite => {
      // By Ancestor Titles
      suite.testResults.sort((a, b) =>
        sortAlphabetically(
          a.ancestorTitles.join(" "),
          b.ancestorTitles.join(" "),
          true
        )
      );
      // By Test Titles
      suite.testResults.sort((a, b) =>
        sortAlphabetically(a.title, b.title, true)
      );
    });
    return sorted;
  }
  return testResults;
};

/**
 * Sorts by Suite filename and Test name | Ascending
 */
const sortByTitleAsc = (testResults: AggregatedResult["testResults"]) => {
  if (testResults) {
    // Sort Suites
    const sorted = testResults.sort((a, b) =>
      sortAlphabetically(a.testFilePath, b.testFilePath)
    );
    // Sort Suite testResults
    sorted.forEach(suite => {
      // By Ancestor Titles
      suite.testResults.sort((a, b) =>
        sortAlphabetically(
          a.ancestorTitles.join(" "),
          b.ancestorTitles.join(" ")
        )
      );
      // By Test Titles
      suite.testResults.sort((a, b) => sortAlphabetically(a.title, b.title));
    });
    return sorted;
  }
  return testResults;
};

/**
 * Helper sorting method
 */
const sortAlphabetically = (a: any, b: any, reversed: boolean = false) => {
  if ((!reversed && a < b) || (reversed && a > b)) {
    return -1;
  } else if ((!reversed && a > b) || (reversed && a < b)) {
    return 1;
  }
  return 0;
};
