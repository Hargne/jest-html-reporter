import fs from "fs";
import sinon, { SinonStub } from "sinon";

import JestHTMLReporter from ".";
import { mockAggregatedResultSingle } from "./__mock__/mockAggregatedResultSingle";
import { mockJestGlobalConfig } from "./__mock__/mockJestGlobalConfig";

describe("index", () => {
  let writeFileSync: SinonStub;

  beforeEach(() => {
    writeFileSync = sinon.stub(fs, "writeFileSync").returns(undefined);
  });
  afterEach(() => {
    writeFileSync.restore();
  });

  it("should return the jest global config if used as a testResultsProcessor", async () => {
    const input = {
      ...mockJestGlobalConfig,
      testResults: mockAggregatedResultSingle,
    };

    // @ts-expect-error - Trigger the reporter as a testResultsProcessor
    const testResultsProcessorOutput = await JestHTMLReporter(input, {});
    expect(testResultsProcessorOutput).toEqual(input);
  });
});
