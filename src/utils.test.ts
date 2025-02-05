import { promises as fs } from "fs";
import path from "path";
import {
  appendToHTML,
  logError,
  logMessage,
  replaceRootDirInPath,
  sanitizeOutput,
} from "./utils";

jest.mock("fs", () => ({
  promises: {
    access: jest.fn(),
    readFile: jest.fn(),
    writeFile: jest.fn(),
  },
}));

describe("utils", () => {
  describe("appendToHTML", () => {
    const mockAccess = fs.access as jest.Mock;
    const mockReadFile = fs.readFile as jest.Mock;
    const mockWriteFile = fs.writeFile as jest.Mock;

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("should append content inside the body tag", async () => {
      const filePath = "test.html";
      const fileContent = "<html><body>Hello</body></html>";
      const contentToAppend = " World";

      mockAccess.mockResolvedValueOnce(undefined);
      mockReadFile.mockResolvedValueOnce(fileContent);

      await appendToHTML(filePath, contentToAppend);

      const expectedContent = "<html><body>Hello World</body></html>";

      expect(mockWriteFile).toHaveBeenCalledWith(
        filePath,
        expectedContent,
        "utf8"
      );
    });

    it("should throw an error if the file does not exist", async () => {
      const filePath = "missing.html";
      const contentToAppend = "Content";

      mockAccess.mockRejectedValueOnce(new Error("ENOENT"));

      await expect(appendToHTML(filePath, contentToAppend)).rejects.toThrow(
        "ENOENT"
      );
      expect(mockReadFile).not.toHaveBeenCalled();
      expect(mockWriteFile).not.toHaveBeenCalled();
    });

    it("should append only the contents if the content also contains a body tag", async () => {
      const filePath = "test.html";
      const fileContent = "<html><body>Hello</body></html>";
      const contentToAppend = "<body> World</body>";

      mockAccess.mockResolvedValueOnce(undefined);
      mockReadFile.mockResolvedValueOnce(fileContent);

      await appendToHTML(filePath, contentToAppend);

      const expectedContent = "<html><body>Hello World</body></html>";

      expect(mockWriteFile).toHaveBeenCalledWith(
        filePath,
        expectedContent,
        "utf8"
      );
    });

    it("should handle errors gracefully and rethrow them with a custom message", async () => {
      const filePath = "error.html";
      const contentToAppend = "Content";

      mockAccess.mockRejectedValueOnce(new Error("Unknown error"));

      await expect(appendToHTML(filePath, contentToAppend)).rejects.toThrow(
        "Unknown error"
      );
      expect(mockReadFile).not.toHaveBeenCalled();
      expect(mockWriteFile).not.toHaveBeenCalled();
    });
  });

  describe("logMessage", () => {
    beforeEach(() => {
      jest.spyOn(console, "log").mockImplementation(() => undefined);
      delete process.env.JEST_WORKER_ID; // Ensure JEST_WORKER_ID is unset
    });

    afterEach(() => {
      jest.restoreAllMocks();
      process.env.JEST_WORKER_ID = "1"; // Reset JEST_WORKER_ID
    });

    it("should log a default message when type is 'default'", () => {
      const result = logMessage("default", "This is a default message");
      expect(result.logColor).toBe("\x1b[37m%s\x1b[0m");
      expect(result.logMsg).toBe(
        "jest-html-reporter >> This is a default message"
      );
      expect(console.log).toHaveBeenCalledWith(
        "\x1b[37m%s\x1b[0m",
        "jest-html-reporter >> This is a default message"
      );
    });

    it("should log a success message when type is 'success'", () => {
      const result = logMessage("success", "This is a success message");
      expect(result.logColor).toBe("\x1b[32m%s\x1b[0m");
      expect(result.logMsg).toBe(
        "jest-html-reporter >> This is a success message"
      );
      expect(console.log).toHaveBeenCalledWith(
        "\x1b[32m%s\x1b[0m",
        "jest-html-reporter >> This is a success message"
      );
    });

    it("should log an error message when type is 'error'", () => {
      const result = logMessage("error", "This is an error message");
      expect(result.logColor).toBe("\x1b[31m%s\x1b[0m");
      expect(result.logMsg).toBe(
        "jest-html-reporter >> This is an error message"
      );
      expect(console.log).toHaveBeenCalledWith(
        "\x1b[31m%s\x1b[0m",
        "jest-html-reporter >> This is an error message"
      );
    });

    it("should not log if JEST_WORKER_ID is set", () => {
      process.env.JEST_WORKER_ID = "1";
      logMessage("default", "This message should not be logged");
      expect(console.log).not.toHaveBeenCalled();
      delete process.env.JEST_WORKER_ID; // Clean up environment variable
    });
  });

  describe("logError", () => {
    beforeEach(() => {
      jest.spyOn(console, "log").mockImplementation(() => undefined);
      delete process.env.JEST_WORKER_ID; // Temporarily remove JEST_WORKER_ID
    });

    afterEach(() => {
      jest.restoreAllMocks();
      process.env.JEST_WORKER_ID = "1"; // Reset JEST_WORKER_ID
    });

    it("should log an error message for an Error object", () => {
      const error = new Error("Something went wrong");
      const result = logError(error);
      expect(result.logColor).toBe("\x1b[31m%s\x1b[0m");
      expect(result.logMsg).toBe("jest-html-reporter >> Something went wrong");
      expect(console.log).toHaveBeenCalledWith(
        "\x1b[31m%s\x1b[0m",
        "jest-html-reporter >> Something went wrong"
      );
    });

    it("should log a generic error message for non-Error objects", () => {
      const error = "Unexpected issue";
      const result = logError(error);
      expect(result.logColor).toBe("\x1b[31m%s\x1b[0m");
      expect(result.logMsg).toBe("jest-html-reporter >> An error occurred");
      expect(console.log).toHaveBeenCalledWith(
        "\x1b[31m%s\x1b[0m",
        "jest-html-reporter >> An error occurred"
      );
    });

    it("should not log if JEST_WORKER_ID is set", () => {
      process.env.JEST_WORKER_ID = "1";
      logError(new Error("This error should not be logged"));
      expect(console.log).not.toHaveBeenCalled();
      delete process.env.JEST_WORKER_ID; // Clean up environment variable
    });
  });

  describe("sanitizeOutput", () => {
    it("should remove ANSI escape codes from the input", () => {
      const input = "\x1b[31mRed text\x1b[0m";
      const result = sanitizeOutput(input);
      expect(result).toBe("Red text");
    });

    it("should remove invalid Unicode characters", () => {
      const input = "Valid text\u0001\u0002Invalid\uFFFF\u0003";
      const result = sanitizeOutput(input);
      expect(result).toBe("Valid textInvalid");
    });

    it("should retain valid Unicode characters", () => {
      const input = "Hello 👋 World 🌍";
      const result = sanitizeOutput(input);
      expect(result).toBe("Hello 👋 World 🌍");
    });

    it("should return an empty string for an input containing only invalid characters", () => {
      const input = "\u0001\u0002\u0003\u0004";
      const result = sanitizeOutput(input);
      expect(result).toBe("");
    });

    it("should return the original string if no ANSI codes or invalid characters exist", () => {
      const input = "Just a plain string.";
      const result = sanitizeOutput(input);
      expect(result).toBe(input);
    });

    it("should throw a TypeError if the input is not a string", () => {
      expect(() => sanitizeOutput(42 as unknown as string)).toThrow(
        new TypeError("Input must be a string")
      );
      expect(() => sanitizeOutput(null as unknown as string)).toThrow(
        new TypeError("Input must be a string")
      );
    });

    it("should handle empty strings gracefully", () => {
      const input = "";
      const result = sanitizeOutput(input);
      expect(result).toBe("");
    });

    it("should handle strings with only whitespace characters", () => {
      const input = " \t\n\r ";
      const result = sanitizeOutput(input);
      expect(result).toBe(" \t\n\r ");
    });
  });

  describe("replaceRootDirInPath", () => {
    const rootDir = "/my/project/root";

    it("should replace <rootDir> with the actual root directory", () => {
      const filePath = "<rootDir>/src/index.ts";
      const result = replaceRootDirInPath(rootDir, filePath);
      expect(result).toBe(path.resolve(rootDir, "src/index.ts"));
    });

    it("should return the file path unchanged if it doesn't start with <rootDir>", () => {
      const filePath = "/src/index.ts";
      const result = replaceRootDirInPath(rootDir, filePath);
      expect(result).toBe(filePath);
    });

    it("should handle paths with <rootDir> at the start but no additional segments", () => {
      const filePath = "<rootDir>";
      const result = replaceRootDirInPath(rootDir, filePath);
      expect(result).toBe(path.resolve(rootDir, "."));
    });

    it("should handle empty file paths", () => {
      const filePath = "";
      const result = replaceRootDirInPath(rootDir, filePath);
      expect(result).toBe(filePath); // Should return the empty string unchanged
    });

    it("should throw an error if rootDir is not a string", () => {
      const filePath = "<rootDir>/src/index.ts";
      expect(() =>
        replaceRootDirInPath(null as unknown as string, filePath)
      ).toThrow("Both rootDir and filePath must be strings.");
    });

    it("should throw an error if filePath is not a string", () => {
      const filePath = null as unknown as string;
      expect(() => replaceRootDirInPath(rootDir, filePath)).toThrow(
        "Both rootDir and filePath must be strings."
      );
    });

    it("should normalize and resolve the file path correctly", () => {
      const filePath = "<rootDir>/src/../src/index.ts";
      const result = replaceRootDirInPath(rootDir, filePath);
      expect(result).toBe(path.resolve(rootDir, "src/index.ts")); // Should normalize the path
    });
  });
});
