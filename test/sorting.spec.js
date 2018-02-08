const sorting = require('../src/sorting');
const mockdataSorting = require('./_mockdata-sorting');

describe('sorting', () => {
	it('should have no effect when sort not configured', () => {
		const { testResults } = mockdataSorting.jestTestData;
		const sortedTestResults = sorting.sortSuiteResults(testResults, undefined);

		expect(sortedTestResults.length).toEqual(testResults.length);

		testResults.forEach((testResult, index) => {
			expect(sortedTestResults[index].testFilePath).toEqual(testResult.testFilePath);
		});
	});

	describe('sortByStatus', () => {
		/*
			see _mockdata-sorting for test data

			expected results for "status" are:
				pending from index-b
				pending from index-c
				failed from index-b
				failed from index-c
				passed from index-a
				passed from index-b
				passed from index-c

			meaning that the results are now broken into three sections:
			1. pending
			2. failed
			3. passed

			the pending and failed sections' sorting should match the passed section's sorting to make tests easier to find
		*/

		it('should order results as 1.pending 2.failed 3.passed', () => {
			const { testResults } = mockdataSorting.jestTestData;
			const sortedTestResults = sorting.sortSuiteResultsByStatus(testResults);

			// pending
			expect(sortedTestResults[0].testResults.length).toEqual(1);
			expect(sortedTestResults[0].numPendingTests).toEqual(1);
			expect(sortedTestResults[0].testFilePath).toEqual('index-b.js');

			expect(sortedTestResults[1].testResults.length).toEqual(1);
			expect(sortedTestResults[1].numPendingTests).toEqual(1);
			expect(sortedTestResults[1].testFilePath).toEqual('index-c.js');

			// failed
			expect(sortedTestResults[2].testResults.length).toEqual(1);
			expect(sortedTestResults[2].numFailingTests).toEqual(1);
			expect(sortedTestResults[2].testFilePath).toEqual('index-b.js');

			expect(sortedTestResults[3].testResults.length).toEqual(1);
			expect(sortedTestResults[3].numFailingTests).toEqual(1);
			expect(sortedTestResults[3].testFilePath).toEqual('index-c.js');

			// passed
			expect(sortedTestResults[4].testResults.length).toEqual(3);
			expect(sortedTestResults[4].numPassingTests).toEqual(3);
			expect(sortedTestResults[4].testFilePath).toEqual('index-a.js');

			expect(sortedTestResults[5].testResults.length).toEqual(1);
			expect(sortedTestResults[5].numPassingTests).toEqual(1);
			expect(sortedTestResults[5].testFilePath).toEqual('index-b.js');

			expect(sortedTestResults[6].testResults.length).toEqual(1);
			expect(sortedTestResults[6].numPassingTests).toEqual(1);
			expect(sortedTestResults[6].testFilePath).toEqual('index-c.js');
		});

		it('should sort all passed tests as default', () => {
			const { testResults } = mockdataSorting.jestTestData;
			const sortedTestResults = sorting.sortSuiteResultsByStatus(testResults);

			// skipping the pending and failed sections of the output, the remainder should match
			// currently the test data has two suites that each have one failed and one pending test, so skip 4
			expect(sortedTestResults[4].testFilePath).toEqual(testResults[0].testFilePath);
			expect(sortedTestResults[5].testFilePath).toEqual(testResults[1].testFilePath);
			expect(sortedTestResults[6].testFilePath).toEqual(testResults[2].testFilePath);
		});
	});
});
