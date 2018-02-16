/* eslint-disable global-require */
const mockdata = require('./mockdata');

const pathToConfig = '../src/config';
// Mock the static config methods
const mockedConfigFunctions = {
	setup: jest.fn(),
	getOutputFilepath: () => 'test-report.html',
	getStylesheetFilepath: () => '../style/defaultTheme.css',
	getPageTitle: jest.fn(),
};

describe('index', () => {
	beforeEach(() => {
		// Reset the mocked modules prior to each test case
		jest.resetModules();
	});

	it('should return the jest test data if used with Jest testResultsProcessor configuration', () => {
		// Mocked config
		jest.mock(pathToConfig, () => ({
			useAsReporter: () => false,
			...mockedConfigFunctions,
		}));
		// The plugin needs to be required after we have mocked the config
		const JestHTMLReporter = require('../src');

		// Trigger the reporter as a testResultsProcessor
		const testResultsProcessorOutput = JestHTMLReporter(mockdata.jestResponse.singleTestResult);
		expect(testResultsProcessorOutput)
			.toEqual(mockdata.jestResponse.singleTestResult);
	});

	it('should return the jest test data if used with Jest reporters configuration', () => {
		// Mocked config
		jest.mock(pathToConfig, () => ({
			useAsReporter: () => true,
			...mockedConfigFunctions,
		}));
		// The plugin needs to be required after we have mocked the config
		const JestHTMLReporter = require('../src');

		// When run as a Jest reporter, the plugin will be instantiated as a class
		const ReporterInitiatedByJest = new JestHTMLReporter();
		// Mock the end of a test run
		const reporterOutput = ReporterInitiatedByJest.onRunComplete(null, mockdata.jestResponse.singleTestResult);
		expect(reporterOutput)
			.toEqual(mockdata.jestResponse.singleTestResult);
	});
});
