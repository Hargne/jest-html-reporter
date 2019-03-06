
const fs = require('fs');
const dateFormat = require('dateformat');
const stripAnsi = require('strip-ansi');
const utils = require('./utils');
const sorting = require('./sorting');
const prettyPrintJson = require('pretty-print-json');

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
		let stylesheetPath = null;

		if (useCssFile) {
			stylesheetPath = this.config.getStylesheetFilepath();
		}

		return this.getStylesheetContent()
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
	 * Returns the stylesheet to be required in the test report.
	 * If styleOverridePath is not defined, it will return the defined theme file.
	 * @return {Promise}
	 */
	getStylesheetContent() {
		const pathToStylesheet = this.config.getStylesheetFilepath();
		return new Promise((resolve, reject) => {
			fs.readFile(pathToStylesheet, 'utf8', (err, content) => {
				if (err) {
					return reject(new Error(`Could not locate the stylesheet: '${pathToStylesheet}': ${err}`));
				}
				return resolve(content);
			});
		});
	}

	/**
	 * Returns a HTML containing the test report.
	 * @param  {String} stylesheet
	 * @param  {Object} data		The test result data
	 * @return {xmlbuilder}
	 */
	renderHtmlReport({ data, stylesheet, stylesheetPath }) {
		return new Promise((resolve, reject) => {
			// Make sure that test data was provided
			if (!data) { return reject(new Error('Test data missing or malformed')); }

			// Fetch Page Title from config
			const pageTitle = this.config.getPageTitle();

			// Create an xmlbuilder object with HTML and Body tags

			const htmlOutput = utils.createHtmlBase({
				pageTitle,
				stylesheet,
				stylesheetPath,
			});

			// HEADER
			const header = htmlOutput.ele('header');

			// Page Title
			header.ele('h1', { id: 'title' }, pageTitle);
			// Logo
			const logo = this.config.getLogo();
			if (logo) {
				header.ele('img', { id: 'logo', src: logo });
			}

			// METADATA
			const metaDataContainer = htmlOutput.ele('div', { id: 'metadata-container' });
			// Timestamp
			const timestamp = new Date(data.startTime);
			metaDataContainer.ele('div', { id: 'timestamp' }, `Start: ${dateFormat(timestamp, this.config.getDateFormat())}`);
			// Test Summary
			metaDataContainer.ele('div', { id: 'summary' }, `
				${data.numTotalTests} tests --
				${data.numPassedTests} passed /
				${data.numFailedTests} failed /
				${data.numPendingTests} pending
			`);

			// Apply the configured sorting of test data
			const sortedTestData = sorting.sortSuiteResults({
				testData: data.testResults,
				sortMethod: this.config.getSort(),
			});

			// Test Suites
			let index = 0;
			let suiteIndex = 0;
			sortedTestData.forEach((suite) => {
				if (!suite.testResults || suite.testResults.length <= 0) { return; }
				if (!suite.testResults.find(test => test.status === 'failed')) { return; }

				const suiteTableId = `suite-table-${suiteIndex}`;
				const suiteConsoleLogId = `suite-consolelog-${suiteIndex}`;
				suiteIndex += 1;
				// Suite Information
				const suiteInfo = htmlOutput.ele('div', { class: 'suite-info', onclick: `showHideSuite('${suiteTableId}','${suiteConsoleLogId}')` });
				// Suite Path
				suiteInfo.ele('div', { class: 'suite-path' }, suite.testFilePath);
				// Suite execution time
				const executionTime = (suite.perfStats.end - suite.perfStats.start) / 1000;
				suiteInfo.ele('div', { class: `suite-time${executionTime > 5 ? ' warn' : ''}` }, `${executionTime}s`);

				// Suite Test Table
				const suiteTable = htmlOutput.ele('table', {
					class: 'suite-table', cellspacing: '0', cellpadding: '0', id: `${suiteTableId}`,
				});

				// Test Results
				const failedTests = suite.testResults.map(test => test.status === 'failed');
				const testsTitles = suite.testResults.map(test => test.title);
				suite.testResults.forEach((test) => {
					if (test.status !== 'failed') { return; }

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
					const consoleLogContainer = htmlOutput.ele('div', { class: 'suite-consolelog', id: `${suiteConsoleLogId}` });
					// Console Log Header
					const consoleLogHeader = consoleLogContainer.ele('div', { class: 'suite-consolelog-header' }, 'Console Log');
					consoleLogHeader.ele('button', { class: 'suite-consolelog-show-hide-all', onclick: 'showHideAll()' }, stripAnsi('Show/Hide All'));

					// Logs
					let counter = 0;
					let skipLog = false;
					let logGroup;
					let logInnerGroup;
					suite.console.forEach((log) => {
						if (log.message === '*** test started ***' && !failedTests[counter]) {
							skipLog = true;
							counter += 1;
						}
						if (!skipLog) {
							if (log.message.includes('*** test started ***') || log.message.includes('*** test ended ***')) {
								const logStartEnd = consoleLogContainer.ele('div', { class: 'suite-consolelog-test' });
								logStartEnd.ele(
									'pre', { class: 'suite-consolelog-item-message' },
									stripAnsi(`${log.message}: ${testsTitles[counter]}`),
								);
								return;
							}
							if (log.message.includes('URL: ')) {
								logGroup = consoleLogContainer.ele('div', { class: 'suite-consolelog-group' });
								const id = `item-message-${index}`;
								logGroup.ele(
									'pre', { class: 'suite-consolelog-group-show-hide', onclick: `showHide('${id}')` },
									stripAnsi(log.message),
								);
								logInnerGroup = logGroup.ele('div', { class: 'suite-consolelog-inner-group', id: `${id}` });
								index += 1;
								return;
							}
							if (logInnerGroup) {
								const logElement = logInnerGroup.ele('div', { class: 'suite-consolelog-item' });
								const logElementPrev = logElement.ele('pre');
								let c;
								try {
									c = JSON.parse(log.message);
								} catch (e) {
									//
								}

								if (c) {
									logElementPrev.raw(prettyPrintJson.toHtml(c || log.message));
								} else {
									logElementPrev.ele('pre', { class: 'suite-consolelog-item-message' }, log.message);
								}
							} else {
								const logElement = consoleLogContainer.ele('div', { class: 'suite-consolelog-item' });
								logElement.ele('pre', { class: 'suite-consolelog-item-message' }, stripAnsi(log.message));
							}
						}
						if (log.message === '*** test ended ***' && failedTests[counter]) {
							skipLog = false;
						}
					});
				}
			});
			// Custom Javascript
			const customScript = this.config.getCustomScriptFilepath();
			if (customScript) {
				htmlOutput.raw(`<script src="${customScript}"></script>`);
			}
			htmlOutput.raw('<script src="https://cdn.jsdelivr.net/npm/pretty-print-json@0.0/dist/pretty-print-json.min.js"></script>');

			return resolve(htmlOutput);
		});
	}
}

module.exports = ReportGenerator;
