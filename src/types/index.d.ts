import { ConsoleBuffer } from "@jest/console";
import { Config } from "@jest/types";
import { AggregatedResult } from "@jest/test-result";

export interface JestHTMLReporterProps {
  testData: AggregatedResult;
  options: Partial<JestHTMLReporterConfiguration>;
  jestConfig?: Config.GlobalConfig;
  consoleLogs?: JestHTMLReporterConsoleLogList[];
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
  includeConsoleLogOrigin: boolean;
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

export interface JestHTMLReporterConsoleLogList {
  filePath: string;
  logs: ConsoleBuffer;
}

export type JestHTMLReporterSortType =
  | "status"
  | "executiondesc"
  | "executionasc"
  | "titledesc"
  | "titleasc";
