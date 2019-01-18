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
				shouldUseCssFile: () => false,
			};
			const reportGenerator = new ReportGenerator(mockedConfig);

			return reportGenerator.renderHtmlReport({ data: mockdata.jestResponse.multipleTestResults, stylesheet: '' })
				.then((xmlBuilderOutput) => {
					expect(xmlBuilderOutput).not.toBeNull();
					expect(xmlBuilderOutput.toString()).toMatch('<html>');
					expect(xmlBuilderOutput.toString()).toMatch('<div id="timestamp">');
				});
		});

		it('allows omission of the timestamp', () => {
			const mockedConfig = {
				getOutputFilepath: () => 'test-report.html',
				getStylesheetFilepath: () => '../style/defaultTheme.css',
				getPageTitle: () => 'Test Report',
				getLogo: () => 'testLogo.png',
				getDateFormat: () => undefined,
				getSort: () => 'default',
				shouldIncludeFailureMessages: () => true,
				getExecutionTimeWarningThreshold: () => 5,
				getCustomScriptFilepath: () => 'test.js',
				shouldUseCssFile: () => false,
			};
			const reportGenerator = new ReportGenerator(mockedConfig);

			return reportGenerator.renderHtmlReport({ data: mockdata.jestResponse.multipleTestResults, stylesheet: '' })
				.then((xmlBuilderOutput) => {
					expect(xmlBuilderOutput).not.toBeNull();
					expect(xmlBuilderOutput.toString()).toMatch('<html>');
					expect(xmlBuilderOutput.toString()).not.toMatch('<div id="timestamp">');
				});
		});

		it('should generate identical output when called twice', () => {
			const mockedConfig = {
				getOutputFilepath: () => 'test-report.html',
				getStylesheetFilepath: () => '../style/defaultTheme.css',
				getPageTitle: () => 'Test Report',
				getLogo: () => 'testLogo.png',
				getDateFormat: () => undefined,
				getSort: () => 'default',
				shouldIncludeFailureMessages: () => true,
				getExecutionTimeWarningThreshold: () => 5,
				getCustomScriptFilepath: () => 'test.js',
				shouldUseCssFile: () => false,
			};
			const mockedData = (n) => {
				const result = Object.create(mockdata.jestResponse.multipleTestResults);
				result.startTime += n;
				return result;
			};
			const reportGenerators = [new ReportGenerator(mockedConfig), new ReportGenerator(mockedConfig)];
			const promises = reportGenerators.map((generator, i) => generator.renderHtmlReport({
				data: mockedData(32768 * i),
				stylesheet: '',
			}));
			Promise.all(promises).then((xmlBuilderOutputs) => {
				const xmlBuilderOutput = xmlBuilderOutputs.pop().toString();
				expect(xmlBuilderOutput).toMatch('<html>');
				xmlBuilderOutputs.forEach((otherOutput) => {
					expect(otherOutput.toString()).toEqual(xmlBuilderOutput);
				});
			});
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
