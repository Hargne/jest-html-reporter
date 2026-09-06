import buildReportBody from "./buildReportBody";
import { logError } from "./logger";
import { GenerateReportProps } from "./types";

export default async function generateReport({
  testData,
  options,
  jestConfig,
  consoleLogs,
}: GenerateReportProps): Promise<string | undefined> {
  try {
    const report = await buildReportBody(testData, options, consoleLogs);
    console.log(report.toString());
    return Promise.resolve(report.toString());
  } catch (error) {
    logError(error);
    return Promise.resolve(undefined);
  }
}
