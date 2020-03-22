import { ConsoleBuffer } from "@jest/console";

export interface IJestHTMLReporterConfigOption<T> {
  environmentVariable: string;
  configValue?: T;
  defaultValue: T;
}

export type JestHTMLReporterSortType =
  | "status"
  | "executiondesc"
  | "executionasc"
  | "titledesc"
  | "titleasc";

export interface IJestHTMLReporterOptions {
  append?: boolean;
  boilerplate?: string;
  customScriptPath?: string;
  dateFormat?: string;
  executionTimeWarningThreshold?: number;
  includeConsoleLog?: boolean;
  includeFailureMsg?: boolean;
  logo?: string;
  outputPath?: string;
  pageTitle?: string;
  sort?: JestHTMLReporterSortType;
  statusIgnoreFilter?: string;
  styleOverridePath?: string;
  theme?: string;
  useCssFile?: boolean;
}

export interface IJestHTMLReporterConfig {
  append: IJestHTMLReporterConfigOption<boolean>;
  boilerplate: IJestHTMLReporterConfigOption<string>;
  customScriptPath: IJestHTMLReporterConfigOption<string>;
  dateFormat: IJestHTMLReporterConfigOption<string>;
  executionTimeWarningThreshold: IJestHTMLReporterConfigOption<number>;
  includeConsoleLog: IJestHTMLReporterConfigOption<boolean>;
  includeFailureMsg: IJestHTMLReporterConfigOption<boolean>;
  logo: IJestHTMLReporterConfigOption<string>;
  outputPath: IJestHTMLReporterConfigOption<string>;
  pageTitle: IJestHTMLReporterConfigOption<string>;
  sort: IJestHTMLReporterConfigOption<JestHTMLReporterSortType>;
  statusIgnoreFilter: IJestHTMLReporterConfigOption<string>;
  styleOverridePath: IJestHTMLReporterConfigOption<string>;
  theme: IJestHTMLReporterConfigOption<string>;
  useCssFile: IJestHTMLReporterConfigOption<boolean>;
}

export interface IJestHTMLReporterConsole {
  filePath: string;
  logs: ConsoleBuffer;
}
