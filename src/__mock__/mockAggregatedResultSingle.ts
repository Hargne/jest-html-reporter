import { AggregatedResult } from "@jest/test-result";
import mockAggregatedResultBase from "./mockAggregatedResult.base";

export const mockAggregatedResultSingle: AggregatedResult = {
  ...mockAggregatedResultBase,
  testResults: [
    {
      console: undefined,
      failureMessage: null,
      numFailingTests: 1,
      numPassingTests: 0,
      numPendingTests: 0,
      numTodoTests: 0,
      perfStats: {
        start: 1498476492,
        end: 1498476650,
        runtime: 158,
        slow: false,
      },
      snapshot: {
        added: 0,
        fileDeleted: false,
        matched: 0,
        unmatched: 0,
        updated: 0,
        unchecked: 0,
        uncheckedKeys: [],
      },
      testFilePath: "/mocked/path/to/test.ts",
      skipped: false,
      displayName: undefined,
      leaks: false,
      coverage: undefined,
      openHandles: [],
      testResults: [
        {
          title: "title",
          status: "passed",
          ancestorTitles: ["ancestor"],
          failureMessages: [],
          failureDetails: [],
          numPassingAsserts: 0,
          fullName: "passed",
          location: null,
          duration: 1,
        },
        {
          title: "title",
          status: "failed",
          ancestorTitles: ["ancestor"],
          failureMessages: [],
          failureDetails: [],
          numPassingAsserts: 0,
          fullName: "failed",
          location: null,
          duration: 2,
        },
        {
          title: "title",
          status: "pending",
          ancestorTitles: ["ancestor"],
          failureMessages: [
            "Error: failures that happened\n" + "\n" + "  at stack trace",
          ],
          failureDetails: ["detailed failure"],
          numPassingAsserts: 0,
          fullName: "pending",
          location: null,
          duration: 3,
        },
      ],
    },
  ],
};
export default mockAggregatedResultSingle;