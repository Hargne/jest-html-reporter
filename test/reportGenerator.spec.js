const mockdata = require('./mockdata');
const ReportGenerator = require('../src/reportGenerator');

const mockedConfig = {
	getOutputFilepath: () => 'test-report.html',
	getBoilerplatePath: () => 'test/boilerplate.html',
	getStylesheetFilepath: () => '../style/defaultTheme.css',
	getPageTitle: () => 'Test Report',
	getLogo: () => 'testLogo.png',
	getDateFormat: () => 'yyyy-mm-dd HH:MM:ss',
	getSort: () => 'default',
	shouldIncludeFailureMessages: () => true,
	getExecutionTimeWarningThreshold: () => 5,
	getCustomScriptFilepath: () => 'test.js',
	shouldUseCssFile: () => false,
	getStatusIgnoreFilter: () => null,
};

describe('reportGenerator', () => {
	describe('renderHtmlReport', () => {
		it('should return a HTML report based on the given input data', () => {
			const reportGenerator = new ReportGenerator(mockedConfig);

			return reportGenerator.renderHtmlReport({ data: mockdata.jestResponse.multipleTestResults, stylesheet: '' })
				.then(xmlBuilderOutput => expect(xmlBuilderOutput.substring(0, 6)).toEqual('<html>'));
		});

		it('should return reject the promise if no data was provided', () => {
			expect.assertions(1);
			const reportGenerator = new ReportGenerator(mockedConfig);

			return expect(reportGenerator.renderHtmlReport({ data: null, stylesheet: null })).rejects
				.toHaveProperty('message', 'Test data missing or malformed');
		});
	});

	describe('getReportBody', () => {
		it('should filter the ignored result statuses', () => {
			mockedConfig.getStatusIgnoreFilter = () => 'passed';
			const reportGenerator = new ReportGenerator(mockedConfig);

			const result = reportGenerator.getReportBody({ data: mockdata.jestResponse.multipleTestResults, pageTitle: '' });
			return expect(result.toString().indexOf('<tr class="passed">') !== -1).toEqual(false);
		});
	});
});
