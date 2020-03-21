import fs from "fs";

/**
 * Method for logging to the terminal
 * @param type
 * @param message
 * @param ignoreConsole
 */
export const logMessage = (
  type: "default" | "success" | "error" = "default",
  message: string,
  ignoreConsole?: boolean
) => {
  const logTypes = {
    default: "\x1b[37m%s\x1b[0m",
    success: "\x1b[32m%s\x1b[0m",
    error: "\x1b[31m%s\x1b[0m"
  };
  const logColor = !logTypes[type] ? logTypes.default : logTypes[type];
  const logMsg = `jest-html-reporter >> ${message}`;
  if (!ignoreConsole) {
    console.log(logColor, logMsg);
  }
  return { logColor, logMsg }; // Return for testing purposes
};

export const getFileContent = async (path: string): Promise<string> => {
  try {
    fs.readFile(path, "utf8", (err, content) => {
      if (err) {
        throw Error(`Could not locate file: '${path}': ${err}`);
      }
      return content;
    });
  } catch (e) {
    logMessage("error", e);
    return;
  }
};
