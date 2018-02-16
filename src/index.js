const ReportGenerator = require('./reportGenerator');
const config = require('./config');

// Initiate the Report Generator with a given config
config.setup();
const reportGenerator = new ReportGenerator(config);

/**
 * Usage as TestResultsProcessor
 * @param {Object} testResult Jest test result data
 */
const TestResultsProcessor = (testResult) => {
	// Generate Report
	reportGenerator.generate({ data: testResult });
	// Return the results as required by Jest
	return testResult;
};

/**
 * Usage as Reporter
 */
class Reporter {
	constructor(globalConfig, options) {
		this.jestConfig = globalConfig;
		this.jestOptions = options;
	}

	onRunComplete(contexts, testResult) {
		this.testResult = testResult;
		// Generate Report
		reportGenerator.generate({ data: testResult });
		// Return the results as required by Jest
		return testResult;
	}
}

module.exports = (config.useAsReporter()) ? Reporter : TestResultsProcessor;
