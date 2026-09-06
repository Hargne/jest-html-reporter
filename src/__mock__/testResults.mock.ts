import { AssertionResult } from "@jest/test-result";

export const mockPassedTestResult: AssertionResult = {
  title: "title",
  status: "passed",
  ancestorTitles: ["ancestor"],
  failureMessages: [],
  failureDetails: [],
  numPassingAsserts: 0,
  fullName: "passed",
  location: null,
  duration: 1,
};

export const mockFailedTestResult: AssertionResult = {
  title: "title",
  status: "failed",
  ancestorTitles: ["ancestor1", "ancestor2"],
  failureMessages: [
    "Error: failures that happened\n" + "\n" + "  at stack trace",
  ],
  failureDetails: ["detailed failure"],
  numPassingAsserts: 0,
  fullName: "failed",
  location: null,
  duration: 2,
};

export const mockPendingTestResult: AssertionResult = {
  title: "title",
  status: "pending",
  ancestorTitles: ["ancestor"],
  failureMessages: [],
  failureDetails: [],
  numPassingAsserts: 0,
  fullName: "pending",
  location: null,
  duration: 3,
};
