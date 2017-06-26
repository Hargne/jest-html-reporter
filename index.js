const methods = require('./src/methods');

module.exports = (testResult) => {
	// Generate Report
	methods.createReport({
		data: testResult,
		output: methods.getOutputFilepath(),
	});
	// Return the results as required by Jest
	return testResult;
};
