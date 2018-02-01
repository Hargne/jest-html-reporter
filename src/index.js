const Methods = require('./methods');

const JestHTMLReporter = (testResult) => {
	// Generate Report
	Methods.createReport(testResult);
	// Return the results as required by Jest
	return testResult;
};

module.exports = JestHTMLReporter;
