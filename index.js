const path = require('path');
const fs = require('fs');
const xmlbuilder = require('xmlbuilder');
const mkdirp = require('mkdirp');
const stripAnsi = require('strip-ansi');

const defaultStylesheet = require('./style');

/**
 * Fetches config from package.json
 */
const packageJson = require(path.join(process.cwd(), 'package.json'));
const config = {};
try {
	const cfg = (packageJson || {})['jest-html-reporter'];
	if (cfg) { Object.assign(config, cfg); }
} catch (e) {
	// do nothing
}

/**
 * Creates a file at the given destination
 * @param  {String} filePath
 * @param  {Any} 	content
 */
const writeFile = (filePath, content) => mkdirp(path.dirname(filePath), (err) => {
	if (err) {
		return console.log(`Jest-HTML-Reporter: Something went wrong when creating the file: ${err}`);
	}
	return fs.writeFile(filePath, content);
});

/**
 * Fetches the stylesheet to be imported in the test report.
 * If the styleOverridePath fil cannot be found, it will respond with the default stylesheet.
 * @param  {String} filePath
 * @return {Promise}
 */
const getStylesheet = () => {
	return new Promise((resolve, reject) => {
		// If the styleOverridePath has not been set, return the default stylesheet.
		if (!config.styleOverridePath) { resolve(defaultStylesheet); }
		// Attempt to read the given file
		fs.readFile(config.styleOverridePath, 'utf8', (err, content) => {
			// If there were no errors, return the content of the given file.
			// Otherwise resolve the promise with the default stylesheet.
			const response = !err ? content : defaultStylesheet;
			resolve(response);
		});
	});
};

/**
 * Sets up a basic HTML page to apply the content to
 * @return {xmlbuilder}
 */
const createHtml = (stylesheet) => xmlbuilder.create({
	html: {
		head: {
			meta: { '@charset': 'utf-8' },
			title: { '#text': config.pageTitle || 'Test suite' },
			style: { '@type': 'text/css', '#text': stylesheet },
		},
		body: {
			h1: { '#text': config.pageTitle || 'Test suite' },
		},
	},
});

/**
 * Returns a HTML containing the test report.
 * @param  {String} stylesheet
 * @param  {Object} data		The test result data
 * @return {xmlbuilder}
 */
const renderHTMLReport = ({ stylesheet, data }) => {
	// Create HTML and Body tags
	const htmlOutput = createHtml(stylesheet);
	// Timestamp
	htmlOutput.ele('div', { id: 'timestamp' }, `
		Start: ${(new Date(data.startTime)).toLocaleString()}
	`);
	// Test Summary
	htmlOutput.ele('div', { id: 'summary' }, `
		${data.numTotalTests} tests /
		${data.numPassedTests} passed /
		${data.numFailedTests} failed /
		${data.numPendingTests} skipped
	`);
	// Loop through each suite
	data.testResults.forEach((suite) => {
		if (suite.testResults.length <= 0) { return; }
		// Suite File Path
		htmlOutput.ele('div', { class: 'suite-info' }, `
			${suite.testFilePath}
			(${(suite.perfStats.end - suite.perfStats.start) / 1000}s)
		`);
		// Suite Test Table
		const suiteTable = htmlOutput.ele('table', { class: 'suite-table', cellspacing: '0', cellpadding: '0' });
		// Loop through each test case
		suite.testResults.forEach((test) => {
			const testTr = suiteTable.ele('tr', { class: test.status });
			// Suite Name(s)
			testTr.ele('td', { class: 'suite' }, test.ancestorTitles.join(' > '));
			// Test name
			const testTitleTd = testTr.ele('td', { class: 'test' }, test.title);
			// Test Failure Messages
			if (test.failureMessages && config.includeFailureMsg) {
				failureMsgDiv = testTitleTd.ele('div', { class: 'failureMessages' })
				test.failureMessages.forEach((failureMsg) => {
					failureMsgDiv.ele('p', { class: 'failureMsg' }, stripAnsi(failureMsg));
				});
			}
			// Test Result
			testTr.ele('td', { class: 'result' }, (test.status === 'passed') ?
				`${test.status} in ${test.duration / 1000}s`
				: test.status
			);
		});
	});
	// Send back the rendered HTML
	return htmlOutput;
};

/**
 * Main Export
 */
module.exports = (testResult) => {
	getStylesheet().then(stylesheet => {
		// Render the HTML report
		const htmlReport = renderHTMLReport({ stylesheet, data: testResult });
		// Write the report to the destination file
		writeFile(config.outputPath || path.join(process.cwd(), 'test-report.html'), htmlReport);
		// Finish up
		console.log('Jest HTML report generated.');
		return testResult;
	});
};
