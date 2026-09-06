import { ConsoleBuffer } from "@jest/console";
import type {
  AggregatedResult,
  Test,
  TestContext,
  TestResult,
} from "@jest/test-result";
import { Circus, Config } from "@jest/types";

export interface JestReporterContext {
  onTestResult?: (unusedTest: Test, result: TestResult) => void;
  onRunComplete?: (
    unusedContexts: Set<TestContext>,
    testData: AggregatedResult,
  ) => Promise<string | undefined>;
}

export type JestGlobalConfig = Config.GlobalConfig | AggregatedResult;

export type JestHTMLReporterResult =
  | Promise<Circus.TestResult>
  | Config.GlobalConfig
  | AggregatedResult
  | undefined;

export interface GenerateReportProps {
  testData: AggregatedResult;
  options: Partial<JestHTMLReporterConfiguration>;
  jestConfig?: Config.GlobalConfig;
  consoleLogs?: ConsoleLogEntry[];
}

export interface JestHTMLReporterConfiguration {
  additionalInformation?: {
    label: string;
    value: string;
  }[];
  append: boolean;
  boilerplate?: string;
  collapseSuitesByDefault: boolean;
  customScriptPath?: string;
  dateFormat: string;
  executionTimeWarningThreshold: number;
  includeConsoleLog: boolean;
  hideConsoleLogOrigin: boolean;
  includeFailureMsg: boolean;
  includeStackTrace: boolean;
  includeSuiteFailure: boolean;
  includeObsoleteSnapshots: boolean;
  logo?: string;
  outputPath: string;
  pageTitle?: string;
  sort?: JestHTMLReporterSortType;
  statusIgnoreFilter?: string;
  styleOverridePath?: string;
  theme?: string;
  useCssFile: boolean;
}

export interface ConsoleLogEntry {
  filePath: string;
  logs: ConsoleBuffer;
}

export type JestHTMLReporterSortType =
  | "status"
  | "executiondesc"
  | "executionasc"
  | "titledesc"
  | "titleasc";

export interface AdditionalInformationEntry {
  label: string;
  value: string;
}
