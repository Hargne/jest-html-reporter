import type { AggregatedResult } from "@jest/test-result";
import xmlbuilder, { XMLElement } from "xmlbuilder";
import dateformat from "dateformat";
import {
  AdditionalInformationEntry,
  ConsoleLogEntry,
  JestHTMLReporterConfiguration,
} from "./types";

export default function buildReportBody(
  testData: AggregatedResult,
  options: Partial<JestHTMLReporterConfiguration>,
  consoleLogs?: ConsoleLogEntry[],
): string {
  const body = xmlbuilder.begin().element("main", {
    class: "jesthtml-content",
  });

  const header = buildHeader({
    title: "Test Report",
  });
  body.importDocument(header);

  const metadataSection = buildMetadataSection(testData);
  body.importDocument(metadataSection);

  if (options.additionalInformation) {
    const additionalInformationSection = buildAdditionalInformationSection(
      options.additionalInformation,
    );
    body.importDocument(additionalInformationSection);
  }

  const summary = buildSummarySection(
    testData,
    options.includeObsoleteSnapshots,
  );
  body.importDocument(summary);

  return body.toString();
}

export function buildHeader({
  title,
  logoSrc,
}: {
  title: string;
  logoSrc?: string;
}): XMLElement {
  const header = xmlbuilder.create("header");

  header.ele("h1", { id: "title" }, title);

  if (logoSrc) {
    header.ele("img", { id: "logo", src: logoSrc });
  }

  return header;
}

export function buildMetadataSection(
  testData: AggregatedResult,
  dateFormat = "yyyy-mm-dd HH:MM:ss",
): XMLElement {
  const section = xmlbuilder.create("section").att("id", "metadata-container");

  if (testData.startTime && !isNaN(testData.startTime)) {
    const startTime = new Date(testData.startTime);
    if (startTime) {
      const formattedStartTime = dateformat(startTime, dateFormat);
      section.ele("div", { id: "timestamp" }, `Started: ${formattedStartTime}`);
    }
  }
  return section;
}

export function buildAdditionalInformationSection(
  additionalInformation: AdditionalInformationEntry[],
): XMLElement {
  const section = xmlbuilder
    .create("section")
    .att("id", "additional-information");

  if (
    additionalInformation &&
    Array.isArray(additionalInformation) &&
    additionalInformation.length > 0
  ) {
    for (const infoEntry of additionalInformation) {
      if (!isAdditionalInformationEntry(infoEntry)) {
        continue;
      }
      section.ele("div", `${infoEntry.label}: ${infoEntry.value}`);
    }
  }

  return section;
}

function isAdditionalInformationEntry(
  item: unknown,
): item is AdditionalInformationEntry {
  return (
    typeof item === "object" &&
    item !== null &&
    typeof (item as { label: unknown }).label === "string" &&
    typeof (item as { value: unknown }).value === "string"
  );
}

export function buildSummarySection(
  testData: AggregatedResult,
  includeObsoleteSnapshots = false,
): XMLElement {
  const section = xmlbuilder.create("section").att("id", "summary");

  const {
    numTotalTestSuites,
    numPassedTestSuites,
    numFailedTestSuites,
    numPendingTestSuites,
    snapshot,
    numTotalTests,
    numPassedTests,
    numFailedTests,
    numPendingTests,
  } = testData;

  // Suite Summary
  const suiteSummaryContainer = section.ele("div", { id: "suite-summary" });
  suiteSummaryContainer.ele(
    "div",
    { class: "summary-total" },
    `Suites (${numTotalTestSuites})`,
  );
  addSummaryItem(suiteSummaryContainer, "passed", numPassedTestSuites);
  addSummaryItem(suiteSummaryContainer, "failed", numFailedTestSuites);
  addSummaryItem(suiteSummaryContainer, "pending", numPendingTestSuites);

  if (includeObsoleteSnapshots && snapshot?.unchecked > 0) {
    suiteSummaryContainer.ele(
      "div",
      {
        class: "summary-obsolete-snapshots",
      },
      `${snapshot.unchecked} obsolete snapshots`,
    );
  }

  // Test Summary
  const testSummaryContainer = section.ele("div", { id: "test-summary" });
  testSummaryContainer.ele(
    "div",
    { class: "summary-total" },
    `Tests (${numTotalTests})`,
  );
  addSummaryItem(testSummaryContainer, "passed", numPassedTests);
  addSummaryItem(testSummaryContainer, "failed", numFailedTests);
  addSummaryItem(testSummaryContainer, "pending", numPendingTests);

  return section;
}

function addSummaryItem(
  container: XMLElement,
  type: "passed" | "failed" | "pending",
  count: number,
) {
  container.ele(
    "div",
    { class: `summary-${type}${count === 0 ? " summary-empty" : ""}` },
    `${count} ${type}`,
  );
}
