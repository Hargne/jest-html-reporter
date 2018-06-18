const ReportGenerator = require('./reportGenerator');
const config = require('./config');

function JestHtmlReporter(globalConfig, options) {
	// Initiate the config and setup the Generator class
	config.setup();
	const reportGenerator = new ReportGenerator(config);

	/**
	 * If the first parameter has a property named 'testResults',
	 * the script is being run as a 'testResultsProcessor'.
	 * We then need to return the test results as they were received from Jest
	 * https://facebook.github.io/jest/docs/en/configuration.html#testresultsprocessor-string
	 */
	if (Object.prototype.hasOwnProperty.call(globalConfig, 'testResults')) {
		// Generate Report
		reportGenerator.generate({ data: globalConfig });
		// Return the results as required by Jest
		return globalConfig;
	}

	/**
	 * The default behaviour - run as Custom Reporter, in parallel with Jest.
	 * This should eventually be turned into a proper class (whenever the testResultsProcessor option is phased out)
	 * https://facebook.github.io/jest/docs/en/configuration.html#reporters-array-modulename-modulename-options
	 */
	this.jestConfig = globalConfig;
	this.jestOptions = options;

	this.onRunComplete = (contexts, testResult) => {
		// Apply the configuration within jest.config.json to the current config
		config.setConfigData(this.jestOptions);
		// Apply the updated config
		reportGenerator.config = config;
		// Generate Report
		return reportGenerator.generate({ data: testResult });
	};
}

module.exports = JestHtmlReporter;
