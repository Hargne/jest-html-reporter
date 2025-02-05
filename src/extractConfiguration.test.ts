import fs from "fs";
import extractConfiguration, {
  sanitizeConfig,
  toEnvVar,
} from "./extractConfiguration";

// Mock the functions used for reading files
jest.mock("fs", () => ({
  existsSync: jest.fn(),
  readFileSync: jest.fn(),
}));

describe("Config Utilities", () => {
  describe("toEnvVar", () => {
    it("should convert camelCase to uppercase with underscores and prepend with JEST_HTML_REPORTER_", () => {
      expect(toEnvVar("statusIgnoreFilter")).toBe(
        "JEST_HTML_REPORTER_STATUS_IGNORE_FILTER"
      );
      expect(toEnvVar("executionTimeWarningThreshold")).toBe(
        "JEST_HTML_REPORTER_EXECUTION_TIME_WARNING_THRESHOLD"
      );
    });
  });

  describe("readJsonFile", () => {
    it("should return parsed JSON from file", () => {
      const mockConfig = { append: true };
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue(
        JSON.stringify(mockConfig)
      );

      const result = extractConfiguration({});
      expect(result.append).toBe(true);
    });

    it("should return an empty object if file doesn't exist", () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);
      (fs.readFileSync as jest.Mock).mockReturnValue(null);

      const result = extractConfiguration({});
      expect(result).toEqual(expect.objectContaining({}));
    });

    it("should return an empty object on JSON parse error", () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue("Invalid JSON");

      const result = extractConfiguration({});
      expect(result).toEqual(expect.objectContaining({}));
    });
  });

  describe("sanitizeConfig", () => {
    it("should sanitize input based on type parsers", () => {
      const input = {
        append: "true", // Should be parsed as a boolean
        dateFormat: "yyyy-MM-dd", // Should be parsed as a string
      };

      const sanitized = sanitizeConfig(input);
      expect(sanitized.append).toBe(true); // True, since 'true' is parsed to boolean
      expect(sanitized.dateFormat).toBe("yyyy-MM-dd");
    });

    it("should skip invalid values", () => {
      const input = {
        append: "invalid", // Should be ignored due to invalid boolean
        dateFormat: "yyyy-MM-dd", // Should be parsed correctly
      };

      const sanitized = sanitizeConfig(input);
      expect(sanitized.append).toBe(false); // Default value
      expect(sanitized.dateFormat).toBe("yyyy-MM-dd");
    });

    it("should handle null and undefined", () => {
      const input = null;
      const sanitized = sanitizeConfig(input);
      expect(sanitized).toEqual({});
    });
  });

  describe("extractConfiguration", () => {
    it("should prioritize environment variables over other sources", () => {
      process.env.JEST_HTML_REPORTER_PAGE_TITLE = "Environment Title";
      const config = extractConfiguration({ pageTitle: "CLI Title" });

      expect(config.pageTitle).toBe("Environment Title");

      delete process.env.JEST_HTML_REPORTER_PAGE_TITLE; // Clear the env var to avoid side effects
    });

    it("should use CLI config when no env var is provided", () => {
      const config = extractConfiguration({ pageTitle: "CLI Title" });

      expect(config.pageTitle).toBe("CLI Title");
    });

    it("should use default values when no config is provided", () => {
      const config = extractConfiguration({});

      expect(config.pageTitle).toBe("Test Report");
      expect(config.dateFormat).toBe("yyyy-mm-dd HH:MM:ss");
    });
  });
});
