const methods = require('../src/methods');
const mockdata = require('./_mockdata');
const mockdataSorting = require('./_mockdata-sorting');

describe('methods', () => {
	describe('createReport ', () => {
		it('should successfully create a test report', () => {
			expect.assertions(1);
			return methods.createReport(mockdata.jestTestData, true)
				.then(response => expect(response.logMsg).toEqual('jest-html-reporter >> Report generated (test-report.html)'));
		});
		it('should log errors', () => {
			expect.assertions(1);
			return methods.createReport(null, true)
				.then(response => expect(response.logMsg).toEqual('jest-html-reporter >> Error: Test data missing or malformed'));
		});
	});

	describe('sort', () => {
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

		it('should have no effect when sort not configured', () => {
			const { testResults } = mockdataSorting.jestTestData;
			const sortedTestResults = methods.processTestSuiteResults(testResults, undefined);

			expect(sortedTestResults.length).toEqual(testResults.length);

			testResults.forEach((testResult, index) => {
				expect(sortedTestResults[index].testFilePath).toEqual(testResult.testFilePath);
			});
		});

		it('should order results as 1.pending 2.failed 3.passed when configured as "status"', () => {
			const { testResults } = mockdataSorting.jestTestData;
			const sortedTestResults = methods.processTestSuiteResults(testResults, 'status');

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

		it('should sort all passed tests as default when configured as "status"', () => {
			const { testResults } = mockdataSorting.jestTestData;
			const sortedTestResults = methods.processTestSuiteResults(testResults, 'status');

			// skipping the pending and failed sections of the output, the remainder should match
			// currently the test data has two suites that each have one failed and one pending test, so skip 4
			expect(sortedTestResults[4].testFilePath).toEqual(testResults[0].testFilePath);
			expect(sortedTestResults[5].testFilePath).toEqual(testResults[1].testFilePath);
			expect(sortedTestResults[6].testFilePath).toEqual(testResults[2].testFilePath);
		});
	});

	describe('logMessage', () => {
		it('should log a given message of an existing log type', () => {
			// Given
			const log = methods.logMessage({
				type: 'success',
				msg: 'This should work',
				ignoreConsole: true,
			});
			// Then
			expect(log.logColor).toEqual('\x1b[32m%s\x1b[0m');
			expect(log.logMsg).toEqual('jest-html-reporter >> This should work');
		});
		it('should set the log type to default if none or an invalid type was provided', () => {
			// Given
			const log1 = methods.logMessage({
				msg: 'This does not have a log type set',
				ignoreConsole: true,
			});
			const log2 = methods.logMessage({
				type: 'invalidType',
				msg: 'The log type is not valid',
				ignoreConsole: true,
			});
			// Then
			expect(log1.logColor).toEqual('\x1b[37m%s\x1b[0m');
			expect(log2.logColor).toEqual('\x1b[37m%s\x1b[0m');
		});
	});
});
