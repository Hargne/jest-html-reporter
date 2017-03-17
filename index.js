const path = require('path');
const fs = require('fs');
const xmlbuilder = require('xmlbuilder');
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
	htmlOutput.ele('div', { id: 'timestamp' }, `Timestamp: ${(new Date(result.startTime)).toLocaleString()}`);

	// Summary Table
	const summaryTable = htmlOutput.ele('table', { id: 'summary-table', cellspacing: '0', cellpadding: '0' });
	summaryTable.ele('tr')
		.ele('td', { class: 'tests' }, `${result.numTotalTests} tests`)
		.ele('td', { class: 'passed' }, `${result.numPassedTests} passed`)
		.ele('td', { class: 'failed' }, `${result.numFailedTests} failed`)
		.ele('td', { class: 'skipped' }, `${result.numPendingTests} skipped`);

	// Result Table
	const resultTable = htmlOutput.ele('table', { id: 'result-table', cellspacing: '0', cellpadding: '0' });
	resultTable.ele('tr')
		.ele('th', {}, 'Suite')
		.ele('th', {}, 'Test')
		.ele('th', {}, 'Time');

	// Loop through each suite
	result.testResults.forEach((suite) => {
		if (suite.testResults.length <= 0) { return; }

		// Loop through each test case
		suite.testResults.forEach((test) => {
			resultTable.ele('tr', { class: test.status })
				.ele('td', { class: 'suite' }, test.ancestorTitles.join(' > '))
				.ele('td', { class: 'test' }, test.title)
				.ele('td', { class: 'time' }, `${test.duration / 1000}s`);
		});
	});

	// Copy file to destination
	fs.writeFile(config.output || path.join(process.cwd(), 'test-report.html'), htmlOutput, (err) => {
		if (err) { console.log(`Something went wrong while generating the jest HTML report\n\t${err.message}`); }
	});

	return result;
};
