import fs from "fs";
import path from "path";
import { IJestHTMLReporterConfig } from "src/index.d";

// Setup Config Options
const config: IJestHTMLReporterConfig = {
  append: {
    defaultValue: false,
    environmentVariable: "JEST_HTML_REPORTER_APPEND"
  },
  boilerplate: {
    defaultValue: null,
    environmentVariable: "JEST_HTML_REPORTER_BOILERPLATE"
  },
  customScriptPath: {
    defaultValue: null,
    environmentVariable: "JEST_HTML_REPORTER_CUSTOM_SCRIPT_PATH"
  },
  dateFormat: {
    defaultValue: "yyyy-mm-dd HH:MM:ss",
    environmentVariable: "JEST_HTML_REPORTER_DATE_FORMAT"
  },
  executionTimeWarningThreshold: {
    defaultValue: 5,
    environmentVariable: "JEST_HTML_REPORTER_EXECUTION_TIME_WARNING_THRESHOLD"
  },
  logo: {
    defaultValue: null,
    environmentVariable: "JEST_HTML_REPORTER_LOGO"
  },
  includeFailureMsg: {
    defaultValue: false,
    environmentVariable: "JEST_HTML_REPORTER_INCLUDE_FAILURE_MSG"
  },
  includeConsoleLog: {
    defaultValue: false,
    environmentVariable: "JEST_HTML_REPORTER_INCLUDE_CONSOLE_LOG"
  },
  outputPath: {
    defaultValue: path.join(process.cwd(), "test-report.html"),
    environmentVariable: "JEST_HTML_REPORTER_OUTPUT_PATH"
  },
  pageTitle: {
    defaultValue: "Test Report",
    environmentVariable: "JEST_HTML_REPORTER_PAGE_TITLE"
  },
  theme: {
    defaultValue: "defaultTheme",
    environmentVariable: "JEST_HTML_REPORTER_THEME"
  },
  sort: {
    defaultValue: null,
    environmentVariable: "JEST_HTML_REPORTER_SORT"
  },
  statusIgnoreFilter: {
    defaultValue: null,
    environmentVariable: "JEST_HTML_REPORTER_STATUS_FILTER"
  },
  styleOverridePath: {
    defaultValue: null,
    environmentVariable: "JEST_HTML_REPORTER_STYLE_OVERRIDE_PATH"
  },
  useCssFile: {
    defaultValue: false,
    environmentVariable: "JEST_HTML_REPORTER_USE_CSS_FILE"
  }
};

export const getConfigValue = (key: keyof IJestHTMLReporterConfig) => {
  const option = config[key];
  if (!option) {
    return;
  }
  if (process.env[option.environmentVariable]) {
    return process.env[option.environmentVariable];
  }
  return option.defaultValue;
};
