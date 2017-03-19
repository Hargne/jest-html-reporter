const path = require('path');
const fs = require('fs');
const xmlbuilder = require('xmlbuilder');
const mkdirp = require('mkdirp');

const style = require('./style');

// Fetch config from package.json
const packageJson = require(path.join(process.cwd(), 'package.json'));
const config = {};
try {
	const cfg = (packageJson || {})['jest-html-reporter'];
	if (cfg) { Object.assign(config, cfg); }
} catch (e) {
	// do nothing
}
// Write file to path
const writeFile = (filePath, content) => mkdirp(path.dirname(filePath), (err) => {
	if (err) {
		return console.log(`Something went wrong when creating the file: ${err}`);
	}
	return fs.writeFile(filePath, content);
});

// Setup a basic HTML page
const createHtml = () => xmlbuilder.create({
	html: {
		head: {
			meta: { '@charset': 'utf-8' },
			title: { '#text': config.pageTitle || 'Test suite' },
			style: { '@type': 'text/css', '#text': style },
		},
		body: {
			h1: { '#text': config.pageTitle || 'Test suite' },
		},
	},
});

module.exports = (result) => {
	// Create HTML and Body tags
	const htmlOutput = createHtml();
	// Timestamp
	htmlOutput.ele('div', { id: 'timestamp' }, `
		Start: ${(new Date(result.startTime)).toLocaleString()}
	`);
	// Test Summary
	htmlOutput.ele('div', { id: 'summary' }, `
		${result.numTotalTests} tests /
		${result.numPassedTests} passed /
		${result.numFailedTests} failed /
		${result.numPendingTests} skipped
	`);
	// Loop through each suite
	result.testResults.forEach((suite) => {
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
					failureMsgDiv.ele('p', { class: 'failureMsg' }, failureMsg);
				});
			}
			// Test Result
			testTr.ele('td', { class: 'result' }, (test.status === 'passed') ? 
				`${test.status} in ${test.duration / 1000}s`
				: test.status
			);
		});
	});

	// Copy file to destination
	writeFile(config.outputPath || path.join(process.cwd(), 'test-report.html'), htmlOutput);

	return result;
};
