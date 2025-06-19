import { promises as fs } from "fs";
import stripAnsi from "strip-ansi";
import path from "path";

export function logMessage(
  type: "default" | "success" | "error",
  message: string,
) {
  const logTypes = {
    default: "\x1b[37m%s\x1b[0m",
    success: "\x1b[32m%s\x1b[0m",
    error: "\x1b[31m%s\x1b[0m",
  };
  const logColor = !logTypes[type] ? logTypes.default : logTypes[type];
  const logMsg = `jest-html-reporter >> ${message}`;
  // Let's log messages to the terminal only if we aren't testing this very module
  if (process.env.JEST_WORKER_ID === undefined) {
    console.log(logColor, logMsg);
  }
  return { logColor, logMsg }; // Return for testing purposes
}

export function logError(error: unknown) {
  const message = error instanceof Error ? error.message : "An error occurred";
  return logMessage("error", message);
}

// Attempts to append the given content to the end of the file's body tag
export async function appendToHTML(
  filePath: string,
  content: string,
): Promise<void> {
  try {
    await fs.access(filePath);
    const fileContent = await fs.readFile(filePath, "utf8");
    const match = /<body>(.*?)<\/body>/s.exec(content);
    const parsedContent = match ? match[1] : content;
    const closingBodyTagMatch = /<\/body>/i.exec(fileContent);
    const indexOfClosingBodyTag = closingBodyTagMatch
      ? closingBodyTagMatch.index
      : 0;

    const newContent = [
      fileContent.slice(0, indexOfClosingBodyTag),
      parsedContent,
      fileContent.slice(indexOfClosingBodyTag),
    ].join("");

    // Write the updated content back to the file
    await fs.writeFile(filePath, newContent, "utf8");
  } catch (err) {
    let message = "An unknown error occurred while appending to the file";
    if (err instanceof Error) {
      message = err.message;
    }
    throw new Error(message);
  }
}

export function sanitizeOutput(input: string): string {
  if (typeof input !== "string") {
    throw new TypeError("Input must be a string");
  }
  const sanitized = stripAnsi(input).replace(
    /[^\t\n\r\x20-\uD7FF\uE000-\uFFFD\u{10000}-\u{10FFFF}]/gu,
    "",
  );
  return sanitized;
}

// Replaces <rootDir> in the file path with the actual path, as performed within Jest
// Copy+paste from https://github.com/facebook/jest/blob/master/packages/jest-config/src/utils.ts
export function replaceRootDirInPath(
  rootDir: string,
  filePath: string,
): string {
  if (typeof rootDir !== "string" || typeof filePath !== "string") {
    throw new TypeError("Both rootDir and filePath must be strings.");
  }

  if (!filePath.startsWith("<rootDir>")) {
    return filePath;
  }

  return path.resolve(
    rootDir,
    path.normalize(`./${filePath.slice("<rootDir>".length)}`),
  );
}

export function sortAlphabetically(a: string, b: string, reversed = false) {
  if ((!reversed && a < b) || (reversed && a > b)) {
    return -1;
  } else if ((!reversed && a > b) || (reversed && a < b)) {
    return 1;
  }
  return 0;
}

export function parseBoolean(value: unknown): boolean {
  if (typeof value === "boolean") {
    return value;
  }
  if (typeof value === "string") {
    return value === "true";
  }
  return false;
}

export function parseNumber(value: unknown): number {
  if (typeof value === "number") {
    return value;
  }
  if (typeof value === "string") {
    return Number(value);
  }
  return NaN;
}

export function parseString(value: unknown): string | undefined {
  if (typeof value === "string") {
    return value;
  }
  return undefined;
}

export const parseArray =
  <T>(isValidItem: (item: unknown) => item is T) =>
  (value: unknown): T[] => {
    if (Array.isArray(value)) {
      return value.filter(isValidItem);
    }
    return [];
  };

export function isAdditionalInformationEntry(
  item: unknown,
): item is { label: string; value: string } {
  return (
    typeof item === "object" &&
    item !== null &&
    typeof (item as { label: unknown }).label === "string" &&
    typeof (item as { value: unknown }).value === "string"
  );
}
