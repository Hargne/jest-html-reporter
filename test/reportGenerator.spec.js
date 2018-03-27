const mockdata = require('./mockdata');
const ReportGenerator = require('../src/reportGenerator');

describe('reportGenerator', () => {
	describe('renderHtmlReport', () => {
		it('should return a HTML report based on the given input data', () => {
			const mockedConfig = {
				getOutputFilepath: () => 'test-report.html',
				getStylesheetFilepath: () => '../style/defaultTheme.css',
				getPageTitle: () => 'Test Report',
				getLogo: () => 'testLogo.png',
				getDateFormat: () => 'yyyy-mm-dd HH:MM:ss',
				getSort: () => 'default',
				shouldIncludeFailureMessages: () => true,
				getExecutionTimeWarningThreshold: () => 5,
				getCustomScriptFilepath: () => 'test.js',
			};
			const reportGenerator = new ReportGenerator(mockedConfig);

			return reportGenerator.renderHtmlReport({ data: mockdata.jestResponse.multipleTestResults, stylesheet: '' })
				.then(xmlBuilderOutput => expect(xmlBuilderOutput).not.toBeNull());
		});

		it('should return reject the promise if no data was provided', () => {
			expect.assertions(1);
			const mockedConfig = {
				getOutputFilepath: () => 'test-report.html',
				getStylesheetFilepath: () => '../style/defaultTheme.css',
				getPageTitle: () => 'Test Report',
				getDateFormat: () => 'yyyy-mm-dd HH:MM:ss',
				getSort: () => 'default',
				shouldIncludeFailureMessages: () => true,
				getExecutionTimeWarningThreshold: () => 5,
				getCustomScriptFilepath: () => 'test.js',
			};
			const reportGenerator = new ReportGenerator(mockedConfig);

			return expect(reportGenerator.renderHtmlReport({ data: null, stylesheet: null })).rejects
				.toHaveProperty('message', 'Test data missing or malformed');
		});
	});
});
