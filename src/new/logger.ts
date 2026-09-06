export function log(
  input: string,
  type: "default" | "success" | "error" = "default",
) {
  const logTypes = {
    default: "\x1b[37m%s\x1b[0m",
    success: "\x1b[32m%s\x1b[0m",
    error: "\x1b[31m%s\x1b[0m",
  };
  const color = !logTypes[type] ? logTypes.default : logTypes[type];
  const message = `jest-html-reporter >> ${input}`;

  // Let's only log messages to the terminal when we are actually running Jest and not testing
  if (process.env.JEST_WORKER_ID === undefined) {
    console.log(color, message);
  }
  return { color, message }; // Return for testing purposes
}

export function logError(error: unknown) {
  const message = error instanceof Error ? error.message : "An error occurred";
  return log(message, "error");
}
