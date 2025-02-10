import { AggregatedResult, AssertionResult, Status } from "@jest/test-result";
import { JestHTMLReporterSortType } from "src/types";
import { sortAlphabetically } from "./utils";

const validStatuses: Status[] = ["pending", "failed", "passed"];

export default (
  testResults: AggregatedResult["testResults"],
  sortTypeInput?: string
): AggregatedResult["testResults"] => {
  const { sortType, params } = parseSortType(sortTypeInput);
  switch (sortType) {
    case "status": {
      // Attempt to grab an array of statuses out of the params
      const statusOrder = params?.every((status) =>
        validStatuses.includes(status as Status)
      )
        ? (params as Status[])
        : undefined;

      return sortByStatus(testResults, statusOrder);
    }
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

// Parses an input string into a valid sort type and additional params
function parseSortType(input?: string): {
  sortType: JestHTMLReporterSortType | null;
  params?: string[];
} {
  if (!input) return { sortType: null };
  const [sortTypeStr, paramStr] = input.split(":").map((s) => s.trim());
  const params = paramStr?.split(",").map((s) => s.trim());

  if (
    ![
      "status",
      "executiondesc",
      "executionasc",
      "titledesc",
      "titleasc",
    ].includes(sortTypeStr.toLowerCase())
  ) {
    return { sortType: null };
  }

  const sortType = sortTypeStr.toLowerCase() as JestHTMLReporterSortType;

  return {
    sortType,
    params,
  };
}

/**
 * Sorts test results based on the order of the given statuses (default: pending -> failed -> passed)
 * A test suite which contains multiple test statuses is then split
 * and will appear in multiple locations in the response.
 */
const sortByStatus = (
  testResults: AggregatedResult["testResults"],
  sortOrder?: Status[]
) => {
  const suites: Pick<
    Record<Status, AggregatedResult["testResults"]>,
    "pending" | "failed" | "passed"
  > = {
    pending: [],
    failed: [],
    passed: [],
  };
  const restSuites: AggregatedResult["testResults"] = [];

  testResults.forEach((result) => {
    const pending: AssertionResult[] = [];
    const failed: AssertionResult[] = [];
    const passed: AssertionResult[] = [];
    const rest: AssertionResult[] = [];

    result.testResults.forEach((testResult) => {
      if (testResult.status === "pending") {
        pending.push(testResult);
      } else if (testResult.status === "failed") {
        failed.push(testResult);
      } else if (testResult.status === "passed") {
        passed.push(testResult);
      } else {
        rest.push(testResult);
      }
    });

    if (pending.length > 0) {
      suites.pending.push({
        ...result,
        testResults: pending,
      });
    }
    if (failed.length > 0) {
      suites.failed.push({
        ...result,
        testResults: failed,
      });
    }
    if (passed.length > 0) {
      suites.passed.push({
        ...result,
        testResults: passed,
      });
    }
    if (rest.length > 0) {
      restSuites.push({
        ...result,
        testResults: rest,
      });
    }
  });

  const defaultSortOrder: Status[] = ["pending", "failed", "passed"];
  // Combines the provided sort order with the default,
  // so that in case the user omits some statuses - it will always contains all
  const combinedSortOrder = [
    ...(sortOrder || []),
    ...defaultSortOrder.filter((status) => !(sortOrder || []).includes(status)),
  ];

  const sortedSuites = Object.entries(suites)
    .sort(([keyA], [keyB]) => {
      return (
        combinedSortOrder.indexOf(keyA as Status) -
        combinedSortOrder.indexOf(keyB as Status)
      );
    })
    .flatMap(([, testResults]) => testResults);

  return [...sortedSuites, ...restSuites];
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
    sorted.forEach((suite) => {
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
    sorted.forEach((suite) => {
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
