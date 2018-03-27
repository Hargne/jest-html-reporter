const utils = require('../src/utils');

describe('utils', () => {
	describe('logMessage', () => {
		it('should log a given message of an existing log type', () => {
			// Given
			const log = utils.logMessage({
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
			const log1 = utils.logMessage({
				msg: 'This does not have a log type set',
				ignoreConsole: true,
			});
			const log2 = utils.logMessage({
				type: 'invalidType',
				msg: 'The log type is not valid',
				ignoreConsole: true,
			});
			// Then
			expect(log1.logColor).toEqual('\x1b[37m%s\x1b[0m');
			expect(log2.logColor).toEqual('\x1b[37m%s\x1b[0m');
		});
	});

	describe('writeFile', () => {
		it('should be able to write a file to a given destination', done => utils.writeFile({
			filePath: 'test-report.html',
			content: 'mockedData',
		}).then((response) => {
			expect(response).toEqual('test-report.html');
			done();
		}));
	});
});
