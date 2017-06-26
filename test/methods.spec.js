const methods = require('../src/methods');
const _mockdata = require('./_mockdata');

describe('methods', () => {
	describe('createReport ', () => {
		it('should successfully create a test report', () => {
			expect.assertions(1);
			return methods.createReport({
				data: _mockdata.jestTestData,
				output: 'test-report.html',
			})
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
		it('should reject the promise if the test data is not an object', () => {
			expect.assertions(1);
			return methods.renderHTML('invalid').catch(err => {
				expect(err).toEqual('Test data missing or malformed');
			});
		});
	});

	describe('logMessage', () => {
		it('should log a given message of an existing log type', () => {
			// Given
			const log = methods.logMessage({
				type: 'success',
				msg: 'msg',
			});
			// Then
			expect(log.logColor).toEqual('\x1b[32m');
			expect(log.logMsg).toEqual('jest-html-reporter >> msg');
		});
		it('should set the log type to default if none or an invalid type was provided', () => {
			// Given
			const log1 = methods.logMessage({
				msg: 'msg',
			});
			const log2 = methods.logMessage({
				type: 'invalid',
				msg: 'msg',
			});
			// Then
			expect(log1.logColor).toEqual('\x1b[37m');
			expect(log2.logColor).toEqual('\x1b[37m');
		});
	});
});
