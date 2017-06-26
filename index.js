const methods = require('./src/methods');

module.exports = (testResult) => {
	// Set output destination
	const destination = methods.getOutputFilepath();
	// Generate Report
	methods.createReport({ data: testResult, output: destination });
	// Return the results as required by Jest
	return testResult;
};
