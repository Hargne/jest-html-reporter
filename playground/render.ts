/**
 * Local preview harness for src/new.
 *
 * Runs the fixture tests in playground/fixtures through real Jest, feeds the
 * resulting AggregatedResult into buildReportBody (bypassing the reporter's
 * onRunComplete plumbing, since generateReport doesn't persist to disk yet),
 * wraps the fragment in a full HTML document, writes playground/report.html
 * and opens it in the default browser.
 *
 * Usage: yarn preview
 */
import { exec } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import type { Config } from "@jest/types";
import { runCLI } from "jest";
import buildReportBody from "../src/new/buildReportBody";
import type { ConsoleLogEntry, JestHTMLReporterConfiguration } from "../src/new/types";

const PLAYGROUND_DIR = __dirname;
const REPORT_PATH = path.join(PLAYGROUND_DIR, "report.html");

const REPORT_OPTIONS: Partial<JestHTMLReporterConfiguration> = {
  pageTitle: "Playground Report",
  includeConsoleLog: true,
  includeFailureMsg: true,
  includeStackTrace: true,
  collapseSuitesByDefault: false,
};

async function main() {
  const { results } = await runCLI(
    {
      config: path.join(PLAYGROUND_DIR, "jest.config.json"),
      _: [],
      $0: "",
    } as unknown as Config.Argv,
    [PLAYGROUND_DIR],
  );

  const consoleLogs: ConsoleLogEntry[] = results.testResults
    .filter((testResult) => testResult.console && testResult.console.length > 0)
    .map((testResult) => ({
      filePath: testResult.testFilePath,
      logs: testResult.console!,
    }));

  const bodyFragment = buildReportBody(results, REPORT_OPTIONS, consoleLogs);
  const html = wrapAsDocument(bodyFragment, REPORT_OPTIONS.pageTitle ?? "Report");

  await fs.writeFile(REPORT_PATH, html, "utf8");
  console.log(`\nReport written to ${REPORT_PATH}`);

  if (process.platform === "darwin") {
    exec(`open "${REPORT_PATH}"`);
  } else {
    console.log("Open it manually — automatic browser launch is only wired up for macOS.");
  }
}

function wrapAsDocument(bodyFragment: string, title: string): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${title}</title>
<link rel="stylesheet" href="../style/defaultTheme.css" />
</head>
<body>
${bodyFragment}
</body>
</html>
`;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
