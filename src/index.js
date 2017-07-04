const methods = require('./methods');

module.exports = (testResult) => {
	// Set output destination
	const destination = methods.getOutputFilepath();
	// Generate Report
	methods.createReport(testResult, destination);
	// Return the results as required by Jest
	return testResult;
};
