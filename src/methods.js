const path = require('path');
const fs = require('fs');
const mkdirp = require('mkdirp');
const xmlbuilder = require('xmlbuilder');
const stripAnsi = require('strip-ansi');
const dateFormat = require('dateformat');
const config = require('./config');

/**
 * Logs a message of a given type in the terminal
 * @param {String} type
 * @param {String} msg
 * @return {Object}
 */
const logMessage = ({ type, msg, ignoreConsole }) => {
	const logTypes = {
		default: '\x1b[37m%s\x1b[0m',
		success: '\x1b[32m%s\x1b[0m',
		error: '\x1b[31m%s\x1b[0m',
	};
	const logColor = (!logTypes[type]) ? logTypes.default : logTypes[type];
	const logMsg = `jest-html-reporter >> ${msg}`;
	if (!ignoreConsole) {
		console.log(logColor, logMsg); // eslint-disable-line
	}
	return { logColor, logMsg }; // Return for testing purposes
};

/**
 * Creates a file at the given destination
 * @param  {String} filePath
 * @param  {Any} 	content
 */
const writeFile = (filePath, content) => new Promise((resolve, reject) => {
	mkdirp(path.dirname(filePath), (err) => {
		if (err) {
			return reject(new Error(`Something went wrong when creating the file: ${err}`));
		}
		return resolve(fs.writeFile(filePath, content));
	});
});

/**
 * Returns the stylesheet to be requireed in the test report.
 * If styleOverridePath is not defined, it will return the default stylesheet (style.js).
 * @param  {String} filePath
 * @return {Promise}
 */
const getStylesheet = () => new Promise((resolve, reject) => {
	const pathToStylesheet = config.getStylesheetFilepath();
	fs.readFile(pathToStylesheet, 'utf8', (err, content) => {
		if (err) {
			return reject(new Error(`Could not locate the stylesheet: '${pathToStylesheet}': ${err}`));
		}
		return resolve(content);
	});
});
/**
 * Sets up a basic HTML page to apply the content to
 * @return {xmlbuilder}
 */
const createHtml = stylesheet => xmlbuilder.create({
	html: {
		head: {
			meta: { '@charset': 'utf-8' },
			title: { '#text': config.getPageTitle() },
			style: { '@type': 'text/css', '#text': stylesheet },
		},
		body: {
			h1: { '@id': 'title', '#text': config.getPageTitle() },
		},
	},
});
/**
 * Returns a HTML containing the test report.
 * @param  {String} stylesheet
 * @param  {Object} testData		The test result data
 * @return {xmlbuilder}
 */
const renderHTML = (testData, stylesheet) => new Promise((resolve, reject) => {
	// Make sure that test data was provided
	if (!testData) { return reject(new Error('Test data missing or malformed')); }

	// Create an xmlbuilder object with HTML and Body tags
	const htmlOutput = createHtml(stylesheet);

	// Timestamp
	const timestamp = new Date(testData.startTime);
	htmlOutput.ele('div', { id: 'timestamp' }, `Start: ${dateFormat(timestamp, config.getDateFormat())}`);

	// Test Summary
	htmlOutput.ele('div', { id: 'summary' }, `
		${testData.numTotalTests} tests --
		${testData.numPassedTests} passed /
		${testData.numFailedTests} failed /
		${testData.numPendingTests} pending
	`);

	// Test Suites
	testData.testResults.forEach((suite) => {
		if (!suite.testResults || suite.testResults.length <= 0) { return; }

		// Suite Information
		const suiteInfo = htmlOutput.ele('div', { class: 'suite-info' });
		// Suite Path
		suiteInfo.ele('div', { class: 'suite-path' }, suite.testFilePath);
		// Suite execution time
		const executionTime = (suite.perfStats.end - suite.perfStats.start) / 1000;
		suiteInfo.ele('div', { class: `suite-time${executionTime > 5 && ' warn'}` }, `${executionTime}s`);

		// Suite Test Table
		const suiteTable = htmlOutput.ele('table', { class: 'suite-table', cellspacing: '0', cellpadding: '0' });

		// Test Results
		suite.testResults.forEach((test) => {
			const testTr = suiteTable.ele('tr', { class: test.status });

			// Suite Name(s)
			testTr.ele('td', { class: 'suite' }, test.ancestorTitles.join(' > '));

			// Test name
			const testTitleTd = testTr.ele('td', { class: 'test' }, test.title);

			// Test Failure Messages
			if (test.failureMessages && (config.shouldIncludeFailureMessages())) {
				const failureMsgDiv = testTitleTd.ele('div', { class: 'failureMessages' });
				test.failureMessages.forEach((failureMsg) => {
					failureMsgDiv.ele('p', { class: 'failureMsg' }, stripAnsi(failureMsg));
				});
			}

			// Append data to <tr>
			testTr.ele('td', { class: 'result' }, (test.status === 'passed') ? `${test.status} in ${test.duration / 1000}s` : test.status);
		});
	});
	return resolve(htmlOutput);
});
/**
 * Generates and writes HTML report to a given path
 * @param  {Object} testData   Jest test information data
 * @return {Promise}
 */
const createReport = (testData, ignoreConsole) => {
	const destination = config.getOutputFilepath();

	return getStylesheet()
		.then(renderHTML.bind(null, testData))
		.then(writeFile.bind(null, destination))
		.then(() => logMessage({
			type: 'success',
			msg: `Report generated (${destination})`,
			ignoreConsole,
		}))
		.catch(error => logMessage({
			type: 'error',
			msg: error,
			ignoreConsole,
		}));
};

module.exports = {
	logMessage,
	writeFile,
	createReport,
	createHtml,
	renderHTML,
};
