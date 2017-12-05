const methods = require('../src/methods');
const _mockdata = require('./_mockdata');

describe('methods', () => {
	describe('createReport ', () => {
		it('should successfully create a test report', () => {
			expect.assertions(1);
			return methods.createReport(_mockdata.jestTestData, 'test-report.html')
			.then(response => {
				expect(response.logMsg).toEqual('jest-html-reporter >> Report generated (test-report.html)');
			});
		});
		it('should log errors', () => {
			expect.assertions(1);
			return methods.createReport()
			.then(response => {
				expect(response.logMsg).toEqual('jest-html-reporter >> Test data missing or malformed');
			});
		});
	});

	describe('renderHTML', () => {
		it('should reject the promise if no test data were provided', () => {
			expect.assertions(1);
			return methods.renderHTML().catch(err => {
				expect(err).toEqual('Test data missing or malformed');
			});
		});
	});

	describe('logMessage', () => {
		it('should log a given message of an existing log type', () => {
			// Given
			const log = methods.logMessage('success', 'msg');
			// Then
			expect(log.logColor).toEqual('\x1b[32m%s\x1b[0m');
			expect(log.logMsg).toEqual('jest-html-reporter >> msg');
		});
		it('should set the log type to default if none or an invalid type was provided', () => {
			// Given
			const log1 = methods.logMessage(null, 'msg');
			const log2 = methods.logMessage('invalidType', 'msg');
			// Then
			expect(log1.logColor).toEqual('\x1b[37m%s\x1b[0m');
			expect(log2.logColor).toEqual('\x1b[37m%s\x1b[0m');
		});
	});
});
