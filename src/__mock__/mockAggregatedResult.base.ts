import { AggregatedResult } from "@jest/test-result";

const mockAggregatedResultBase: AggregatedResult = {
  numFailedTestSuites: 1,
  numFailedTests: 1,
  numPassedTestSuites: 0,
  numPassedTests: 0,
  numPendingTestSuites: 0,
  numPendingTests: 0,
  numRuntimeErrorTestSuites: 0,
  numTodoTests: 0,
  numTotalTestSuites: 1,
  numTotalTests: 1,
  openHandles: [],
  snapshot: {
    added: 0,
    didUpdate: false,
    failure: false,
    filesAdded: 0,
    filesRemoved: 0,
    filesRemovedList: [],
    filesUnmatched: 0,
    filesUpdated: 0,
    matched: 0,
    total: 0,
    unchecked: 2,
    uncheckedKeysByFile: [
      {
        filePath: "index-a.js",
        keys: ["test", "test2"],
      },
    ],
    unmatched: 0,
    updated: 0,
  },
  startTime: 1584892601719,
  success: false,
  testResults: [],
  wasInterrupted: false,
  coverageMap: null,
};
export default mockAggregatedResultBase;
