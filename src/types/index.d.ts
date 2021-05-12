import { ConsoleBuffer } from "@jest/console";
import { Config } from "@jest/types";
import { AggregatedResult } from "@jest/test-result";

export interface JestHTMLReporterProps {
  testData: AggregatedResult;
  options: IJestHTMLReporterConfigOptions;
  jestConfig?: Config.GlobalConfig;
  consoleLogs?: IJestHTMLReporterConsole[];
}

export type IJestHTMLReporterConfigOptions = {
  append?: boolean;
  boilerplate?: string;
  customScriptPath?: string;
  dateFormat?: string;
  executionTimeWarningThreshold?: number;
  includeConsoleLog?: boolean;
  includeFailureMsg?: boolean;
  includeSuiteFailure?: boolean;
  includeObsoleteSnapshots?: boolean;
  logo?: string;
  outputPath?: string;
  pageTitle?: string;
  sort?: JestHTMLReporterSortType;
  statusIgnoreFilter?: string;
  styleOverridePath?: string;
  theme?: string;
  useCssFile?: boolean;
};

export interface IJestHTMLReporterConfigOption<T> {
  environmentVariable: string;
  configValue?: T;
  defaultValue: T;
}

export interface IJestHTMLReporterConfig {
  append: IJestHTMLReporterConfigOption<
    IJestHTMLReporterConfigOptions["append"]
  >;
  boilerplate: IJestHTMLReporterConfigOption<
    IJestHTMLReporterConfigOptions["boilerplate"]
  >;
  customScriptPath: IJestHTMLReporterConfigOption<
    IJestHTMLReporterConfigOptions["customScriptPath"]
  >;
  dateFormat: IJestHTMLReporterConfigOption<
    IJestHTMLReporterConfigOptions["dateFormat"]
  >;
  executionTimeWarningThreshold: IJestHTMLReporterConfigOption<
    IJestHTMLReporterConfigOptions["executionTimeWarningThreshold"]
  >;
  includeConsoleLog: IJestHTMLReporterConfigOption<
    IJestHTMLReporterConfigOptions["includeConsoleLog"]
  >;
  includeFailureMsg: IJestHTMLReporterConfigOption<
    IJestHTMLReporterConfigOptions["includeFailureMsg"]
  >;
  includeSuiteFailure: IJestHTMLReporterConfigOption<
    IJestHTMLReporterConfigOptions["includeSuiteFailure"]
  >;
  includeObsoleteSnapshots: IJestHTMLReporterConfigOption<
    IJestHTMLReporterConfigOptions["includeObsoleteSnapshots"]
  >;
  logo: IJestHTMLReporterConfigOption<IJestHTMLReporterConfigOptions["logo"]>;
  outputPath: IJestHTMLReporterConfigOption<
    IJestHTMLReporterConfigOptions["outputPath"]
  >;
  pageTitle: IJestHTMLReporterConfigOption<
    IJestHTMLReporterConfigOptions["pageTitle"]
  >;
  sort: IJestHTMLReporterConfigOption<IJestHTMLReporterConfigOptions["sort"]>;
  statusIgnoreFilter: IJestHTMLReporterConfigOption<
    IJestHTMLReporterConfigOptions["statusIgnoreFilter"]
  >;
  styleOverridePath: IJestHTMLReporterConfigOption<
    IJestHTMLReporterConfigOptions["styleOverridePath"]
  >;
  theme: IJestHTMLReporterConfigOption<IJestHTMLReporterConfigOptions["theme"]>;
  useCssFile: IJestHTMLReporterConfigOption<
    IJestHTMLReporterConfigOptions["useCssFile"]
  >;
}

export interface IJestHTMLReporterConsole {
  filePath: string;
  logs: ConsoleBuffer;
}

export type JestHTMLReporterSortType =
  | "status"
  | "executiondesc"
  | "executionasc"
  | "titledesc"
  | "titleasc";
