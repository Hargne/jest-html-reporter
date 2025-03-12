import path from "path";
import fs from "fs";
import { JestHTMLReporterConfiguration } from "./types";
import {
  isAdditionalInformationEntry,
  parseArray,
  parseBoolean,
  parseNumber,
  parseString,
} from "./utils";

const defaultValues: JestHTMLReporterConfiguration = {
  additionalInformation: [],
  append: false,
  boilerplate: undefined,
  collapseSuitesByDefault: false,
  customScriptPath: undefined,
  dateFormat: "yyyy-mm-dd HH:MM:ss",
  executionTimeWarningThreshold: 5,
  includeConsoleLog: false,
  includeFailureMsg: false,
  includeStackTrace: true,
  includeSuiteFailure: false,
  includeObsoleteSnapshots: false,
  logo: undefined,
  outputPath: path.join(process.cwd(), "test-report.html"),
  pageTitle: "Test Report",
  sort: undefined,
  statusIgnoreFilter: undefined,
  styleOverridePath: undefined,
  theme: "defaultTheme",
  useCssFile: false,
};

// Convert config key to environment variable format
export function toEnvVar(key: string): string {
  return `JEST_HTML_REPORTER_${key
    .replace(/([a-z])([A-Z])/g, "$1_$2")
    .toUpperCase()}`;
}

// Read JSON file safely
export function readJsonFile(filePath: string) {
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, "utf8"));
    }
  } catch {
    // Ignore errors
    return {};
  }
  return {};
}

// Type conversion functions
const typeParsers: {
  [key in keyof JestHTMLReporterConfiguration]: (
    value: unknown
  ) => string | number | boolean | unknown[] | undefined;
} = {
  additionalInformation: parseArray(isAdditionalInformationEntry),
  append: parseBoolean,
  boilerplate: parseString,
  collapseSuitesByDefault: parseBoolean,
  customScriptPath: parseString,
  dateFormat: parseString,
  executionTimeWarningThreshold: parseNumber,
  includeConsoleLog: parseBoolean,
  includeFailureMsg: parseBoolean,
  includeStackTrace: parseBoolean,
  includeSuiteFailure: parseBoolean,
  includeObsoleteSnapshots: parseBoolean,
  logo: parseString,
  outputPath: parseString,
  pageTitle: parseString,
  sort: parseString,
  statusIgnoreFilter: parseString,
  styleOverridePath: parseString,
  theme: parseString,
  useCssFile: parseBoolean,
};

// Function to clean & validate configuration input
export function sanitizeConfig(
  input: unknown
): Partial<JestHTMLReporterConfiguration> {
  if (typeof input !== "object" || input === null) {
    return {};
  }

  return (
    Object.keys(defaultValues) as (keyof JestHTMLReporterConfiguration)[]
  ).reduce((sanitized, key) => {
    const parser = typeParsers[key];
    if (parser && typeof parser === "function" && key in input) {
      const value = parser((input as JestHTMLReporterConfiguration)[key]);
      if (value !== undefined) {
        return { ...sanitized, [key]: value };
      }
    }
    return sanitized;
  }, {});
}

export default function (cliConfig: unknown): JestHTMLReporterConfiguration {
  // Read from environment variables
  const envConfig: Partial<JestHTMLReporterConfiguration> = (
    Object.keys(defaultValues) as (keyof JestHTMLReporterConfiguration)[]
  ).reduce((config, key) => {
    const envKey = toEnvVar(key);
    if (process.env[envKey] !== undefined) {
      return { ...config, [key]: process.env[envKey] };
    }
    return config;
  }, {});

  // Read from JSON files
  const customJsonConfig = readJsonFile(
    path.join(process.cwd(), "jesthtmlreporter.config.json")
  );
  const packageJsonConfig =
    readJsonFile(path.join(process.cwd(), "package.json"))[
      "jest-html-reporter"
    ] || {};

  // Merge configurations in priority order (with sanitization)
  return {
    ...defaultValues, // Default values (lowest priority)
    ...sanitizeConfig(packageJsonConfig), // package.json "jest" section
    ...sanitizeConfig(customJsonConfig), // Custom JSON config
    ...sanitizeConfig(cliConfig), // CLI parameters
    ...sanitizeConfig(envConfig), // Environment variables (highest priority)
  };
}
