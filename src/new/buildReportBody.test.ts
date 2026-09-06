import mockAggregatedResultBase from "../__mock__/mockAggregatedResult.base";
import { mockAggregatedResultSingle } from "../__mock__/mockAggregatedResultSingle";
import {
  buildAdditionalInformationSection,
  buildHeader,
  buildMetadataSection,
  buildSummarySection,
} from "./buildReportBody";

describe("buildHeader", () => {
  it("builds a header with a title", () => {
    const header = buildHeader({
      title: "Test Report",
    });

    expect(header.toString()).toBe(
      '<header><h1 id="title">Test Report</h1></header>',
    );
  });

  it("builds a header with a title and logo", () => {
    const header = buildHeader({
      title: "Test Report",
      logoSrc: "logo.png",
    });

    expect(header.toString()).toBe(
      '<header><h1 id="title">Test Report</h1><img id="logo" src="logo.png"/></header>',
    );
  });

  it("escapes user-provided content", () => {
    const header = buildHeader({
      title: "<script>alert('hello')</script>",
    });

    expect(header.toString()).toContain(
      "&lt;script&gt;alert('hello')&lt;/script&gt;",
    );
  });
});

describe("buildMetadataSection", () => {
  it("builds a metadata section with test data", () => {
    const metadataSection = buildMetadataSection(mockAggregatedResultBase);

    expect(metadataSection.toString()).toBe(
      '<section id="metadata-container"><div id="timestamp">Started: 2020-03-22 16:56:41</div></section>',
    );
  });

  it("builds a metadata section with test data and custom date format", () => {
    const metadataSection = buildMetadataSection(
      mockAggregatedResultBase,
      "dd/mm/yyyy HH:MM:ss",
    );

    expect(metadataSection.toString()).toBe(
      '<section id="metadata-container"><div id="timestamp">Started: 22/03/2020 16:56:41</div></section>',
    );
  });
});

describe("buildAdditionalInformationSection", () => {
  it("builds an additional information section with entries", () => {
    const additionalInformation = [
      { label: "Environment", value: "Production" },
      { label: "Version", value: "1.0.0" },
    ];

    const additionalInfoSection = buildAdditionalInformationSection(
      additionalInformation,
    );
    expect(additionalInfoSection.toString()).toBe(
      '<section id="additional-information"><div>Environment: Production</div><div>Version: 1.0.0</div></section>',
    );
  });

  it("builds an empty additional information section when no entries are provided", () => {
    const additionalInfoSection = buildAdditionalInformationSection([]);
    expect(additionalInfoSection.toString()).toBe(
      '<section id="additional-information"/>',
    );
  });
});

describe("buildSummarySection", () => {
  it("builds a summary section with test data", () => {
    const summarySection = buildSummarySection(mockAggregatedResultBase);
    const xml = summarySection.toString();

    expect(xml).toContain('<section id="summary">');
    expect(xml).toContain('<div id="suite-summary">');
    expect(xml).toContain("Suites (1)");
    expect(xml).toContain("0 passed");
    expect(xml).toContain("1 failed");
    expect(xml).toContain("0 pending");
  });

  it("renders all test counts in the test summary", () => {
    const testData = {
      ...mockAggregatedResultBase,
      numTotalTests: 10,
      numPassedTests: 6,
      numFailedTests: 3,
      numPendingTests: 1,
    };

    const document = new DOMParser().parseFromString(
      buildSummarySection(testData).toString(),
      "text/xml",
    );
    const testSummary = document.querySelector("#test-summary");

    expect(testSummary?.querySelector(".summary-total")?.textContent).toBe(
      "Tests (10)",
    );
    expect(testSummary?.querySelector(".summary-passed")?.textContent).toBe(
      "6 passed",
    );
    expect(testSummary?.querySelector(".summary-failed")?.textContent).toBe(
      "3 failed",
    );
    expect(testSummary?.querySelector(".summary-pending")?.textContent).toBe(
      "1 pending",
    );
  });

  it("does not mark non-zero test counts as empty", () => {
    const testData = {
      ...mockAggregatedResultBase,
      numPassedTests: 1,
      numFailedTests: 1,
      numPendingTests: 1,
    };

    const document = new DOMParser().parseFromString(
      buildSummarySection(testData).toString(),
      "text/xml",
    );
    const testSummary = document.querySelector("#test-summary");

    expect(
      testSummary?.querySelector(".summary-passed.summary-empty"),
    ).toBeNull();
    expect(
      testSummary?.querySelector(".summary-failed.summary-empty"),
    ).toBeNull();
    expect(
      testSummary?.querySelector(".summary-pending.summary-empty"),
    ).toBeNull();
  });

  it("marks zero test counts as empty", () => {
    const testData = {
      ...mockAggregatedResultBase,
      numPassedTests: 0,
      numFailedTests: 0,
      numPendingTests: 0,
    };

    const document = new DOMParser().parseFromString(
      buildSummarySection(testData).toString(),
      "text/xml",
    );
    const testSummary = document.querySelector("#test-summary");

    expect(
      testSummary?.querySelector(".summary-passed.summary-empty"),
    ).not.toBeNull();
    expect(
      testSummary?.querySelector(".summary-failed.summary-empty"),
    ).not.toBeNull();
    expect(
      testSummary?.querySelector(".summary-pending.summary-empty"),
    ).not.toBeNull();
  });

  it("displays correct CSS classes for passed suites", () => {
    const testData = {
      ...mockAggregatedResultBase,
      numPassedTestSuites: 5,
    };
    const summarySection = buildSummarySection(testData);
    const xml = summarySection.toString();

    expect(xml).toContain('class="summary-passed"');
  });

  it("displays empty class when no passed suites", () => {
    const testData = {
      ...mockAggregatedResultBase,
      numPassedTestSuites: 0,
    };
    const summarySection = buildSummarySection(testData);
    const xml = summarySection.toString();

    expect(xml).toContain('class="summary-passed summary-empty"');
  });

  it("displays correct CSS classes for failed suites", () => {
    const testData = {
      ...mockAggregatedResultBase,
      numFailedTestSuites: 3,
    };
    const summarySection = buildSummarySection(testData);
    const xml = summarySection.toString();

    expect(xml).toContain('class="summary-failed"');
  });

  it("displays empty class when no failed suites", () => {
    const testData = {
      ...mockAggregatedResultBase,
      numFailedTestSuites: 0,
    };
    const summarySection = buildSummarySection(testData);
    const xml = summarySection.toString();

    expect(xml).toContain('class="summary-failed summary-empty"');
  });

  it("displays correct CSS classes for pending suites", () => {
    const testData = {
      ...mockAggregatedResultBase,
      numPendingTestSuites: 2,
    };
    const summarySection = buildSummarySection(testData);
    const xml = summarySection.toString();

    expect(xml).toContain('class="summary-pending"');
  });

  it("displays empty class when no pending suites", () => {
    const testData = {
      ...mockAggregatedResultBase,
      numPendingTestSuites: 0,
    };
    const summarySection = buildSummarySection(testData);
    const xml = summarySection.toString();

    expect(xml).toContain('class="summary-pending summary-empty"');
  });

  it("includes obsolete snapshots when flag is true and unchecked > 0", () => {
    const testData = {
      ...mockAggregatedResultBase,
      snapshot: { ...mockAggregatedResultBase.snapshot, unchecked: 5 },
    };
    const summarySection = buildSummarySection(testData, true);
    const xml = summarySection.toString();

    expect(xml).toContain('class="summary-obsolete-snapshots"');
    expect(xml).toContain("5 obsolete snapshots");
  });

  it("does not include obsolete snapshots when flag is false", () => {
    const testData = {
      ...mockAggregatedResultBase,
      snapshot: { ...mockAggregatedResultBase.snapshot, unchecked: 5 },
    };
    const summarySection = buildSummarySection(testData, false);
    const xml = summarySection.toString();

    expect(xml).not.toContain("summary-obsolete-snapshots");
    expect(xml).not.toContain("obsolete snapshots");
  });

  it("does not include obsolete snapshots when unchecked is 0", () => {
    const testData = {
      ...mockAggregatedResultBase,
      snapshot: { ...mockAggregatedResultBase.snapshot, unchecked: 0 },
    };
    const summarySection = buildSummarySection(testData, true);
    const xml = summarySection.toString();

    expect(xml).not.toContain("summary-obsolete-snapshots");
    expect(xml).not.toContain("obsolete snapshots");
  });

  it("handles snapshot with no unchecked items", () => {
    const testData = {
      ...mockAggregatedResultBase,
      snapshot: { ...mockAggregatedResultBase.snapshot, unchecked: 0 },
    };
    const summarySection = buildSummarySection(testData, true);
    const xml = summarySection.toString();

    // Should not throw and should contain basic structure
    expect(xml).toContain('<section id="summary">');
    expect(xml).not.toContain("obsolete snapshots");
  });

  it("renders all suite counts correctly with single result", () => {
    const summarySection = buildSummarySection(mockAggregatedResultSingle);
    const xml = summarySection.toString();

    expect(xml).toContain("Suites (1)");
  });

  it("renders section with id attribute", () => {
    const summarySection = buildSummarySection(mockAggregatedResultBase);
    const xml = summarySection.toString();

    expect(xml).toContain('<section id="summary">');
  });

  it("renders suite-summary div with correct id", () => {
    const summarySection = buildSummarySection(mockAggregatedResultBase);
    const xml = summarySection.toString();

    expect(xml).toContain('<div id="suite-summary">');
  });
});
