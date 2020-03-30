import { AggregatedResult } from "@jest/test-result";
import { Config } from "@jest/types";

import mockedContent from "./mockedcontent";
export const mockedSingleTestResultReportHTML = mockedContent;

const mockedJestResponseBase: AggregatedResult = {
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
    unchecked: 0,
    uncheckedKeysByFile: [],
    unmatched: 0,
    updated: 0
  },
  startTime: 1584892601719,
  success: false,
  testResults: [],
  wasInterrupted: false,
  coverageMap: null
};

export const mockedJestResponseSingleTestResult: AggregatedResult = {
  ...mockedJestResponseBase,
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
        end: 1498476650
      },
      snapshot: undefined,
      testFilePath: "/mocked/path/to/test.ts",
      skipped: false,
      displayName: undefined,
      leaks: false,
      sourceMaps: undefined,
      coverage: undefined,
      openHandles: [],
      testResults: [
        {
          title: "title",
          status: "passed",
          ancestorTitles: ["ancestor"],
          failureMessages: [],
          numPassingAsserts: 0,
          fullName: undefined,
          location: null,
          duration: 1
        },
        {
          title: "title",
          status: "failed",
          ancestorTitles: ["ancestor"],
          failureMessages: [],
          numPassingAsserts: 0,
          fullName: undefined,
          location: null,
          duration: 2
        },
        {
          title: "title",
          status: "pending",
          ancestorTitles: ["ancestor"],
          failureMessages: ["failure"],
          numPassingAsserts: 0,
          fullName: undefined,
          location: null,
          duration: 3
        }
      ]
    }
  ]
};

export const mockedJestResponseMultipleTestResult: AggregatedResult = {
  ...mockedJestResponseBase,
  testResults: [
    {
      numFailingTests: 0,
      numPassingTests: 3,
      numPendingTests: 0,
      console: undefined,
      failureMessage: null,
      numTodoTests: 0,
      snapshot: undefined,
      skipped: false,
      displayName: undefined,
      leaks: false,
      sourceMaps: undefined,
      coverage: undefined,
      openHandles: [],
      testResults: [
        {
          title: "title b",
          status: "passed",
          ancestorTitles: ["ancestor b"],
          failureMessages: [],
          numPassingAsserts: 0,
          fullName: undefined,
          location: null,
          duration: 3
        },
        {
          title: "title c",
          status: "passed",
          ancestorTitles: ["ancestor c"],
          failureMessages: [],
          numPassingAsserts: 0,
          fullName: undefined,
          location: null,
          duration: 3
        },
        {
          title: "title a",
          status: "passed",
          ancestorTitles: ["ancestor a"],
          failureMessages: [],
          numPassingAsserts: 0,
          fullName: undefined,
          location: null,
          duration: 3
        }
      ],
      perfStats: {
        start: 1498476492,
        end: 1498476640
      },
      testFilePath: "index-a.js"
    },
    {
      numFailingTests: 1,
      numPassingTests: 1,
      numPendingTests: 1,
      console: undefined,
      failureMessage: null,
      numTodoTests: 0,
      snapshot: undefined,
      skipped: false,
      displayName: undefined,
      leaks: false,
      sourceMaps: undefined,
      coverage: undefined,
      openHandles: [],
      testResults: [
        {
          title: "title b",
          status: "pending",
          ancestorTitles: ["ancestor b"],
          failureMessages: [],
          numPassingAsserts: 0,
          fullName: undefined,
          location: null,
          duration: 3
        },
        {
          title: "title c",
          status: "failed",
          ancestorTitles: ["ancestor c", "ancestor child"],
          failureMessages: ["failure"],
          numPassingAsserts: 0,
          fullName: undefined,
          location: null,
          duration: 3
        },
        {
          title: "title a",
          status: "passed",
          ancestorTitles: ["ancestor a"],
          failureMessages: [],
          numPassingAsserts: 0,
          fullName: undefined,
          location: null,
          duration: 3
        }
      ],
      perfStats: {
        start: 1498476492,
        end: 1498476639
      },
      testFilePath: "index-b.js"
    },
    {
      numFailingTests: 1,
      numPassingTests: 1,
      numPendingTests: 1,
      console: undefined,
      failureMessage: null,
      numTodoTests: 0,
      snapshot: undefined,
      skipped: false,
      displayName: undefined,
      leaks: false,
      sourceMaps: undefined,
      coverage: undefined,
      openHandles: [],
      testResults: [
        {
          title: "title a",
          status: "pending",
          ancestorTitles: ["ancestor a"],
          failureMessages: [],
          numPassingAsserts: 0,
          fullName: undefined,
          location: null,
          duration: 3
        },
        {
          title: "title c",
          status: "failed",
          ancestorTitles: ["ancestor c"],
          failureMessages: ["failure"],
          numPassingAsserts: 0,
          fullName: undefined,
          location: null,
          duration: 3
        },
        {
          title: "title b",
          status: "passed",
          ancestorTitles: ["ancestor b"],
          failureMessages: [],
          numPassingAsserts: 0,
          fullName: undefined,
          location: null,
          duration: 3
        }
      ],
      perfStats: {
        start: 1498476492,
        end: 1498476650
      },
      testFilePath: "index-c.js"
    }
  ]
};

export const mockedFullReportOutput = `<html><head><meta charset="utf-8"/><title>Test Report</title></head><body>A Test!</body></html>`;

export const mockedJestGlobalConfig: Config.GlobalConfig = {
  bail: 0,
  changedFilesWithAncestor: false,
  changedSince: undefined,
  coverageProvider: "v8",
  collectCoverage: true,
  collectCoverageFrom: [],
  collectCoverageOnlyFrom: undefined,
  coverageDirectory: "/path",
  coverageReporters: ["json", "html", "text", "text-summary"],
  coverageThreshold: {
    global: { branches: 50, functions: 50, lines: 50, statements: 50 }
  },
  detectLeaks: false,
  detectOpenHandles: false,
  enabledTestsMap: undefined,
  errorOnDeprecated: false,
  expand: false,
  filter: null,
  findRelatedTests: undefined,
  forceExit: undefined,
  globalSetup: null,
  globalTeardown: null,
  json: false,
  lastCommit: undefined,
  listTests: false,
  logHeapUsage: undefined,
  maxConcurrency: 5,
  maxWorkers: 7,
  noSCM: undefined,
  noStackTrace: false,
  nonFlagArgs: [],
  notify: false,
  notifyMode: "failure-change",
  onlyChanged: undefined,
  onlyFailures: undefined,
  outputFile: undefined,
  passWithNoTests: false,
  projects: null,
  replname: undefined,
  reporters: [["default", {}]],
  rootDir: "/path",
  runTestsByPath: false,
  silent: undefined,
  skipFilter: false,
  testFailureExitCode: 1,
  testNamePattern: undefined,
  testPathPattern: "",
  testResultsProcessor: null,
  testSequencer: "/path",
  testTimeout: undefined,
  updateSnapshot: "new",
  useStderr: false,
  verbose: null,
  watch: false,
  watchAll: undefined,
  watchPlugins: undefined,
  watchman: true
};
