import { TestResult } from "@jest/test-result";
import xmlbuilder, { XMLElement } from "xmlbuilder";
import buildTestResult from "./buildTestResult";

export default function buildSuiteResult(
  suiteResult: TestResult,
  renderFailureMessages?: boolean,
  collapseByDefault?: boolean,
): XMLElement {
  const container = xmlbuilder.create("details").att("class", "suite-result");
  if (!collapseByDefault) {
    container.att("open", "open");
  }

  container.ele("summary", { class: "suite-path" }, suiteResult.testFilePath);

  for (const assertionResult of suiteResult.testResults) {
    const testResultElement = buildTestResult(
      assertionResult,
      renderFailureMessages,
    );
    container.importDocument(testResultElement);
  }
  return container;
}
