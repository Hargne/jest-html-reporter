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

    const document = new DOMParser().parseFromString(
      header.toString(),
      "text/xml",
    );
    const headerEl = document.querySelector("header");

    expect(headerEl?.querySelector("h1#title")?.textContent).toBe(
      "Test Report",
    );
    expect(headerEl?.querySelector("img#logo")).toBeNull();
  });

  it("builds a header with a title and logo", () => {
    const header = buildHeader({
      title: "Test Report",
      logoSrc: "logo.png",
    });

    const document = new DOMParser().parseFromString(
      header.toString(),
      "text/xml",
    );
    const headerEl = document.querySelector("header");

    expect(headerEl?.querySelector("h1#title")?.textContent).toBe(
      "Test Report",
    );
    expect(headerEl?.querySelector("img#logo")?.getAttribute("src")).toBe(
      "logo.png",
    );
  });

  it("escapes user-provided content", () => {
    const header = buildHeader({
      title: "<script>alert('hello')</script>",
    });

    const document = new DOMParser().parseFromString(
      header.toString(),
      "text/xml",
    );

    expect(document.querySelector("h1#title")?.textContent).toBe(
      "<script>alert('hello')</script>",
    );
    expect(document.querySelector("script")).toBeNull();
  });
});

describe("buildMetadataSection", () => {
  it("builds a metadata section with test data", () => {
    const metadataSection = buildMetadataSection(mockAggregatedResultBase);

    const document = new DOMParser().parseFromString(
      metadataSection.toString(),
      "text/xml",
    );

    expect(
      document.querySelector("section#metadata-container #timestamp")
        ?.textContent,
    ).toBe("Started: 2020-03-22 16:56:41");
  });

  it("builds a metadata section with test data and custom date format", () => {
    const metadataSection = buildMetadataSection(
      mockAggregatedResultBase,
      "dd/mm/yyyy HH:MM:ss",
    );

    const document = new DOMParser().parseFromString(
      metadataSection.toString(),
      "text/xml",
    );

    expect(document.querySelector("#timestamp")?.textContent).toBe(
      "Started: 22/03/2020 16:56:41",
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

    const document = new DOMParser().parseFromString(
      additionalInfoSection.toString(),
      "text/xml",
    );
    const entries = Array.from(
      document.querySelectorAll("#additional-information > div"),
    ).map((entry) => entry.textContent);

    expect(entries).toEqual(["Environment: Production", "Version: 1.0.0"]);
  });

  it("builds an empty additional information section when no entries are provided", () => {
    const additionalInfoSection = buildAdditionalInformationSection([]);

    const document = new DOMParser().parseFromString(
      additionalInfoSection.toString(),
      "text/xml",
    );

    expect(document.querySelector("section#additional-information")).not.toBeNull();
    expect(
      document.querySelectorAll("#additional-information > div"),
    ).toHaveLength(0);
  });
});

describe("buildSummarySection", () => {
  it("builds a summary section with test data", () => {
    const summarySection = buildSummarySection(mockAggregatedResultBase);

    const document = new DOMParser().parseFromString(
      summarySection.toString(),
      "text/xml",
    );
    const suiteSummary = document.querySelector("section#summary #suite-summary");

    expect(suiteSummary?.querySelector(".summary-total")?.textContent).toBe(
      "Suites (1)",
    );
    expect(suiteSummary?.querySelector(".summary-passed")?.textContent).toBe(
      "0 passed",
    );
    expect(suiteSummary?.querySelector(".summary-failed")?.textContent).toBe(
      "1 failed",
    );
    expect(suiteSummary?.querySelector(".summary-pending")?.textContent).toBe(
      "0 pending",
    );
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
    const document = new DOMParser().parseFromString(
      buildSummarySection(testData).toString(),
      "text/xml",
    );

    expect(
      document.querySelector("#suite-summary .summary-passed")?.getAttribute("class"),
    ).toBe("summary-passed");
  });

  it("displays empty class when no passed suites", () => {
    const testData = {
      ...mockAggregatedResultBase,
      numPassedTestSuites: 0,
    };
    const document = new DOMParser().parseFromString(
      buildSummarySection(testData).toString(),
      "text/xml",
    );

    expect(
      document.querySelector("#suite-summary .summary-passed.summary-empty"),
    ).not.toBeNull();
  });

  it("displays correct CSS classes for failed suites", () => {
    const testData = {
      ...mockAggregatedResultBase,
      numFailedTestSuites: 3,
    };
    const document = new DOMParser().parseFromString(
      buildSummarySection(testData).toString(),
      "text/xml",
    );

    expect(
      document.querySelector("#suite-summary .summary-failed")?.getAttribute("class"),
    ).toBe("summary-failed");
  });

  it("displays empty class when no failed suites", () => {
    const testData = {
      ...mockAggregatedResultBase,
      numFailedTestSuites: 0,
    };
    const document = new DOMParser().parseFromString(
      buildSummarySection(testData).toString(),
      "text/xml",
    );

    expect(
      document.querySelector("#suite-summary .summary-failed.summary-empty"),
    ).not.toBeNull();
  });

  it("displays correct CSS classes for pending suites", () => {
    const testData = {
      ...mockAggregatedResultBase,
      numPendingTestSuites: 2,
    };
    const document = new DOMParser().parseFromString(
      buildSummarySection(testData).toString(),
      "text/xml",
    );

    expect(
      document.querySelector("#suite-summary .summary-pending")?.getAttribute("class"),
    ).toBe("summary-pending");
  });

  it("displays empty class when no pending suites", () => {
    const testData = {
      ...mockAggregatedResultBase,
      numPendingTestSuites: 0,
    };
    const document = new DOMParser().parseFromString(
      buildSummarySection(testData).toString(),
      "text/xml",
    );

    expect(
      document.querySelector("#suite-summary .summary-pending.summary-empty"),
    ).not.toBeNull();
  });

  it("includes obsolete snapshots when flag is true and unchecked > 0", () => {
    const testData = {
      ...mockAggregatedResultBase,
      snapshot: { ...mockAggregatedResultBase.snapshot, unchecked: 5 },
    };
    const document = new DOMParser().parseFromString(
      buildSummarySection(testData, true).toString(),
      "text/xml",
    );

    expect(
      document.querySelector(".summary-obsolete-snapshots")?.textContent,
    ).toBe("5 obsolete snapshots");
  });

  it("does not include obsolete snapshots when flag is false", () => {
    const testData = {
      ...mockAggregatedResultBase,
      snapshot: { ...mockAggregatedResultBase.snapshot, unchecked: 5 },
    };
    const document = new DOMParser().parseFromString(
      buildSummarySection(testData, false).toString(),
      "text/xml",
    );

    expect(document.querySelector(".summary-obsolete-snapshots")).toBeNull();
  });

  it("does not include obsolete snapshots when unchecked is 0", () => {
    const testData = {
      ...mockAggregatedResultBase,
      snapshot: { ...mockAggregatedResultBase.snapshot, unchecked: 0 },
    };
    const document = new DOMParser().parseFromString(
      buildSummarySection(testData, true).toString(),
      "text/xml",
    );

    expect(document.querySelector(".summary-obsolete-snapshots")).toBeNull();
  });

  it("handles snapshot with no unchecked items", () => {
    const testData = {
      ...mockAggregatedResultBase,
      snapshot: { ...mockAggregatedResultBase.snapshot, unchecked: 0 },
    };
    const document = new DOMParser().parseFromString(
      buildSummarySection(testData, true).toString(),
      "text/xml",
    );

    // Should not throw and should contain basic structure
    expect(document.querySelector("section#summary")).not.toBeNull();
    expect(document.querySelector(".summary-obsolete-snapshots")).toBeNull();
  });

  it("renders all suite counts correctly with single result", () => {
    const document = new DOMParser().parseFromString(
      buildSummarySection(mockAggregatedResultSingle).toString(),
      "text/xml",
    );

    expect(
      document.querySelector("#suite-summary .summary-total")?.textContent,
    ).toBe("Suites (1)");
  });

  it("renders section with id attribute", () => {
    const document = new DOMParser().parseFromString(
      buildSummarySection(mockAggregatedResultBase).toString(),
      "text/xml",
    );

    expect(document.querySelector("section#summary")).not.toBeNull();
  });

  it("renders suite-summary div with correct id", () => {
    const document = new DOMParser().parseFromString(
      buildSummarySection(mockAggregatedResultBase).toString(),
      "text/xml",
    );

    expect(document.querySelector("div#suite-summary")).not.toBeNull();
  });
});
