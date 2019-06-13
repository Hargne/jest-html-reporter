
const dateFormat = require('dateformat');
const stripAnsi = require('strip-ansi');
const xmlbuilder = require('xmlbuilder');
const utils = require('./utils');
const sorting = require('./sorting');

class ReportGenerator {
	constructor(config) {
		this.config = config;
	}

	/**
	 * Generates and writes HTML report to a given path
	 * @param  {Object} data   Jest test information data
	 * @return {Promise}
	 */
	generate({ data, ignoreConsole }) {
		const fileDestination = this.config.getOutputFilepath();
		const useCssFile = this.config.shouldUseCssFile();
		const shouldGetStylesheetContent = this.config.shouldGetStylesheetContent();
		let stylesheetPath = null;
		let stylesheetContent = null;

		if (useCssFile) {
			stylesheetPath = this.config.getStylesheetFilepath();
		}

		if (shouldGetStylesheetContent) {
			stylesheetContent = () => this.getStylesheetContent();
		} else {
			stylesheetContent = () => Promise.resolve();
		}

		return stylesheetContent()
			.then(stylesheet => this.renderHtmlReport({
				data,
				stylesheet,
				stylesheetPath,
			}))
			.then(xmlBuilderOutput => utils.writeFile({
				filePath: fileDestination,
				content: xmlBuilderOutput,
			}))
			.then(() => utils.logMessage({
				type: 'success',
				msg: `Report generated (${fileDestination})`,
				ignoreConsole,
			}))
			.catch(error => utils.logMessage({
				type: 'error',
				msg: error,
				ignoreConsole,
			}));
	}

	/**
	 * Reads the boilerplate file given from config
	 * and attempts to replace any occurrence of {jesthtmlreporter-content}
	 * with the given content.
	 * @return {Promise}
	 */
	integrateContentIntoBoilerplate({ content }) {
		const filePath = this.config.getBoilerplatePath();
		return new Promise((resolve, reject) => utils.getFileContent({ filePath })
			.then(boilerplateContent => resolve(boilerplateContent.replace('{jesthtmlreporter-content}', content)))
			.catch(err => reject(err)));
	}

	/**
	 * Returns the stylesheet to be required in the test report.
	 * If styleOverridePath is not defined, it will return the defined theme file.
	 * @return {Promise}
	 */
	getStylesheetContent() {
		const filePath = this.config.getStylesheetFilepath();
		return utils.getFileContent({ filePath });
	}

	/**
	 * Returns a HTML containing the test report.
	 * @param  {Object} data			The test result data (required)
	 * @param  {String} stylesheet		Optional stylesheet content
	 * @param  {String} stylesheetPath	Optional path to an external stylesheet
	 * @return {xmlbuilder}
	 */
	renderHtmlReport({ data, stylesheet, stylesheetPath }) {
		return new Promise((resolve, reject) => {
			// Make sure that test data was provided
			if (!data) { return reject(new Error('Test data missing or malformed')); }

			// Fetch Page Title from config
			const pageTitle = this.config.getPageTitle();
			// Create Report Body
			const reportContent = this.getReportBody({ data, pageTitle });

			// ** (CUSTOM) BOILERPLATE OPTION
			// Check if a boilerplate has been specified
			const boilerplatePath = this.config.getBoilerplatePath();
			if (boilerplatePath) {
				return this.integrateContentIntoBoilerplate({ content: reportContent })
					.then(output => resolve(output));
			}

			// ** (DEFAULT) PREDEFINED HTML OPTION
			// Create an xmlbuilder object with HTML and HEAD tag
			const htmlOutput = utils.createHtmlBase({ pageTitle, stylesheet, stylesheetPath });
			// Body tag
			const body = htmlOutput.ele('body');
			// Add report content to body
			body.raw(reportContent);
			// Custom Javascript
			const customScript = this.config.getCustomScriptFilepath();
			if (customScript) {
				body.raw(`<script src="${customScript}"></script>`);
			}
			return resolve(htmlOutput);
		});
	}

	/**
	 * Returns a HTML containing the test report body contentt.
	 * @param  {Object} data		The test result data
	 * @param  {String} pageTitle	The title of the report
	 * @return {xmlbuilder}
	 */
	getReportBody({ data, pageTitle }) {
		const reportBody = xmlbuilder.begin().element('div', { id: 'jesthtml-content' });
		// HEADER
		// **
		const header = reportBody.ele('header');
		// Page Title
		header.ele('h1', { id: 'title' }, pageTitle);
		// Logo
		const logo = this.config.getLogo();
		if (logo) {
			header.ele('img', { id: 'logo', src: logo });
		}

		// ** METADATA
		const metaDataContainer = reportBody.ele(
			'div',
			{ id: 'metadata-container' },
		);
		// Timestamp
		const timestamp = new Date(data.startTime);
		metaDataContainer.ele(
			'div',
			{ id: 'timestamp' },
			`Start: ${dateFormat(timestamp, this.config.getDateFormat())}`,
		);
		// Test Summary
		metaDataContainer.ele(
			'div',
			{ id: 'summary' },
			`${data.numTotalTests} tests -- ${data.numPassedTests} passed / ${data.numFailedTests} failed / ${data.numPendingTests} pending`,
		);

		// ** SORTING
		// Apply the configured sorting of test data
		const sortedTestData = sorting.sortSuiteResults({
			testData: data.testResults,
			sortMethod: this.config.getSort(),
		});

		// ** IGNORED STATUSES FILTER
		// Setup ignored Test Result Statuses
		const statusIgnoreFilter = this.config.getStatusIgnoreFilter();
		let ignoredStatuses = [];
		if (statusIgnoreFilter) {
			ignoredStatuses = statusIgnoreFilter.replace(/\s/g, '').toLowerCase().split(',');
		}

		// ** TEST SUITES
		sortedTestData.forEach((suite) => {
			// Filter out the test results with statuses that equals the statusIgnoreFilter
			for (let i = suite.testResults.length - 1; i >= 0; i -= 1) {
				if (ignoredStatuses.includes(suite.testResults[i].status)) {
					suite.testResults.splice(i, 1);
				}
			}
			// Ignore this suite if there are no results
			if (!suite.testResults || suite.testResults.length <= 0) { return; }

			// Suite Information
			const suiteInfo = reportBody.ele('div', { class: 'suite-info' });
			// Suite Path
			suiteInfo.ele('div', { class: 'suite-path' }, suite.testFilePath);
			// Suite execution time
			const executionTime = (suite.perfStats.end - suite.perfStats.start) / 1000;
			suiteInfo.ele('div', { class: `suite-time${executionTime > 5 ? ' warn' : ''}` }, `${executionTime}s`);

			// Suite Test Table
			const suiteTable = reportBody.ele('table', { class: 'suite-table', cellspacing: '0', cellpadding: '0' });

			// Test Results
			suite.testResults.forEach((test) => {
				const testTr = suiteTable.ele('tr', { class: test.status });
				// Suite Name(s)
				testTr.ele('td', { class: 'suite' }, test.ancestorTitles.join(' > '));
				// Test name
				const testTitleTd = testTr.ele('td', { class: 'test' }, test.title);
				// Test Failure Messages
				if (test.failureMessages && (this.config.shouldIncludeFailureMessages())) {
					const failureMsgDiv = testTitleTd.ele('div', { class: 'failureMessages' });
					test.failureMessages.forEach((failureMsg) => {
						failureMsgDiv.ele('pre', { class: 'failureMsg' }, stripAnsi(failureMsg));
					});
				}
				// Append data to <tr>
				testTr.ele('td', { class: 'result' }, (test.status === 'passed') ? `${test.status} in ${test.duration / 1000}s` : test.status);
			});

			// Test Suite console.logs
			if (suite.console && suite.console.length > 0 && (this.config.shouldIncludeConsoleLog())) {
				// Console Log Container
				const consoleLogContainer = reportBody.ele('div', { class: 'suite-consolelog' });
				// Console Log Header
				consoleLogContainer.ele('div', { class: 'suite-consolelog-header' }, 'Console Log');
				// Logs
				suite.console.forEach((log) => {
					const logElement = consoleLogContainer.ele('div', { class: 'suite-consolelog-item' });
					logElement.ele('pre', { class: 'suite-consolelog-item-origin' }, stripAnsi(log.origin));
					logElement.ele('pre', { class: 'suite-consolelog-item-message' }, stripAnsi(log.message));
				});
			}
		});

		return reportBody;
	}
}

module.exports = ReportGenerator;
