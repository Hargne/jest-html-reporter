import { AssertionResult } from "@jest/test-result";
import xmlbuilder, { XMLElement } from "xmlbuilder";
import sanitizeString from "./utils/sanitizeString";

export default function buildTestResult(
  testResult: AssertionResult,
  renderFailureMessages?: boolean,
): XMLElement {
  const container = xmlbuilder
    .create("div")
    .att("class", `test-result ${testResult.status}`);

  const infoContainer = container.ele("div", { class: "test-info" });

  infoContainer.ele(
    "div",
    { class: "test-suitename" },
    testResult.ancestorTitles?.length > 0
      ? testResult.ancestorTitles.join(" > ")
      : "",
  );
  infoContainer.ele("div", { class: "test-title" }, testResult.title);
  infoContainer.ele("div", { class: "test-status" }, testResult.status);
  infoContainer.ele(
    "div",
    { class: "test-duration" },
    testResult.duration ? `${testResult.duration / 1000}s` : "",
  );

  if (renderFailureMessages && testResult.failureMessages?.length > 0) {
    addFailureMessages(container, testResult.failureMessages);
  }

  return container;
}

function addFailureMessages(
  container: XMLElement,
  failureMessages: string[],
  withStackTrace?: boolean,
) {
  if (failureMessages.length == 0) {
    return;
  }

  const failureContainer = container.ele("div", {
    class: "failureMessages",
  });

  failureMessages.forEach((failureMessage) => {
    const message = withStackTrace
      ? failureMessage
      : failureMessage
          .split(/\n\s+at/)[0]
          .trim()
          .replace(/\n+$/, "");

    failureContainer.ele(
      "pre",
      { class: "failureMsg" },
      sanitizeString(message),
    );
  });
}
