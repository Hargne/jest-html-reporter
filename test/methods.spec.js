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
		it('should have a default sort', () => {
			expect(require('../src/config').getSort()).toEqual('default'); // eslint-disable-line
		});

		it('should have no effect when sort not configured', () => {
			const { testResults } = mockdataSorting.jestTestData;
			const sortedTestResults = methods.sortTestResults(testResults);
			testResults.forEach((testResult, index) => {
				expect(sortedTestResults[index].numPassingTests).toEqual(testResult.numPassingTests);
			});
		});

		it('should float pending tests to the top when configured as "status"', () => {
			const { testResults } = mockdataSorting.jestTestData;
			const sortedTestResults = methods.sortTestResults(testResults, 'status');

			expect(sortedTestResults[0].numPendingTests > 0).toBeTruthy();
		});

		it('should float failing tests after pending tests when configured as "status"', () => {
			const { testResults } = mockdataSorting.jestTestData;
			const sortedTestResults = methods.sortTestResults(testResults, 'status');

			expect(sortedTestResults[0].numFailingTests === 0).toBeTruthy();
			expect(sortedTestResults[1].numFailingTests > 0).toBeTruthy();
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
