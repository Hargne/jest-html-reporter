'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var fs = _interopDefault(require('fs'));
var path = _interopDefault(require('path'));
var mkdirp = _interopDefault(require('mkdirp'));
var xmlbuilder = _interopDefault(require('xmlbuilder'));
var dateformat = _interopDefault(require('dateformat'));
var stripAnsi = _interopDefault(require('strip-ansi'));

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var utils = createCommonjsModule(function (module) {
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
const writeFile = ({ filePath, content }) => new Promise((resolve, reject) => {
	mkdirp(path.dirname(filePath), (mkdirpError) => {
		if (mkdirpError) {
			return reject(new Error(`Something went wrong when creating the folder: ${mkdirpError}`));
		}
		return fs.writeFile(filePath, content, (writeFileError) => {
			if (writeFileError) {
				return reject(new Error(`Something went wrong when creating the file: ${writeFileError}`));
			}
			return resolve(filePath);
		});
	});
});

/**
 * Sets up a basic HTML page to apply the content to
 * @return {xmlbuilder}
 */
const createHtmlBase = ({ pageTitle, stylesheet }) => {
	const htmlBase = {
		html: {
			head: {
				meta: { '@charset': 'utf-8' },
				title: { '#text': pageTitle },
			},
		},
	};


	const styleSheet = stylesheet.replace(/(\r\n|\n|\r)/gm, '');
	htmlBase.html.head.style = { '@type': 'text/css', '#text': styleSheet };

	htmlBase.html.head.link = {
		'@rel': 'stylesheet', '@type': 'text/css', '@href': 'https://cdn.jsdelivr.net/npm/pretty-print-json@0.0/dist/pretty-print-json.css',
	};

	htmlBase.html.script = {
		'#text': 'function showHide(item){' +
		'var element = document.getElementById(item); ' +
		'if (element.style.display === "block")' +
		'{ element.style.display = "none";' +
		'} else { ' +
		'element.style.display = "block"; }}' +
		'function showHideAll(){' +
		'var elements = document.getElementsByClassName("suite-consolelog-inner-group");' +
		'for(let element of elements){' +
		'if (element.style.display === "block")' +
		'{ element.style.display = "none";' +
		'} else { ' +
		'element.style.display = "block"; }}}' +
		'function showHideSuite(tableId, consoleLogId){' +
		'showHide(tableId); showHide(consoleLogId);}',
	};

	return xmlbuilder.create(htmlBase);
};

const sortAlphabetically = ({ a, b, reversed }) => {
	if ((!reversed && a < b) || (reversed && a > b)) {
		return -1;
	} else if ((!reversed && a > b) || (reversed && a < b)) {
		return 1;
	}
	return 0;
};

module.exports = {
	logMessage,
	writeFile,
	createHtmlBase,
	sortAlphabetically,
};
});

var utils_1 = utils.logMessage;
var utils_2 = utils.writeFile;
var utils_3 = utils.createHtmlBase;
var utils_4 = utils.sortAlphabetically;

var sorting = createCommonjsModule(function (module) {
/**
 * Splits test suites apart based on individual test status and sorts by that status:
 * 1. Pending
 * 2. Failed
 * 3. Passed
 * @param {Array} suiteResults
 */
const byStatus = (suiteResults) => {
	const pendingSuites = [];
	const failingSuites = [];
	const passingSuites = [];

	suiteResults.forEach((suiteResult) => {
		const pending = [];
		const failed = [];
		const passed = [];

		suiteResult.testResults.forEach((x) => {
			if (x.status === 'pending') {
				pending.push(x);
			} else if (x.status === 'failed') {
				failed.push(x);
			} else {
				passed.push(x);
			}
		});

		if (pending.length) {
			pendingSuites.push(Object.assign({}, suiteResult, { testResults: pending }));
		}
		if (failed.length) {
			failingSuites.push(Object.assign({}, suiteResult, { testResults: failed }));
		}
		if (passed.length) {
			passingSuites.push(Object.assign({}, suiteResult, { testResults: passed }));
		}
	});

	return [].concat(pendingSuites, failingSuites, passingSuites);
};

/**
 * Sorts by Execution Time | Descending
 * @param {Array} suiteResults
 */
const byExecutionDesc = (suiteResults) => {
	if (suiteResults) {
		suiteResults.sort((a, b) =>
			(b.perfStats.end - b.perfStats.start) - (a.perfStats.end - a.perfStats.start));
	}
	return suiteResults;
};

/**
 * Sorts by Execution Time | Ascending
 * @param {Array} suiteResults
 */
const byExecutionAsc = (suiteResults) => {
	if (suiteResults) {
		suiteResults.sort((a, b) =>
			(a.perfStats.end - a.perfStats.start) - (b.perfStats.end - b.perfStats.start));
	}
	return suiteResults;
};

/**
 * Sorts by Suite filename and Test name | Descending
 * @param {Array} suiteResults
 */
const byTitleDesc = (suiteResults) => {
	if (suiteResults) {
		// Sort Suites
		const sorted = suiteResults.sort((a, b) =>
			utils.sortAlphabetically({ a: a.testFilePath, b: b.testFilePath, reversed: true }));
		// Sort Suite testResults
		sorted.forEach((suite) => {
			suite.testResults.sort((a, b) =>
				utils.sortAlphabetically({
					a: a.ancestorTitles.join(' '),
					b: b.ancestorTitles.join(' '),
					reversed: true,
				}));
		});
		return sorted;
	}
	return suiteResults;
};

/**
 * Sorts by Suite filename and Test name | Ascending
 * @param {Array} suiteResults
 */
const byTitleAsc = (suiteResults) => {
	if (suiteResults) {
		// Sort Suites
		const sorted = suiteResults.sort((a, b) =>
			utils.sortAlphabetically({ a: a.testFilePath, b: b.testFilePath }));
		// Sort Suite testResults
		sorted.forEach((suite) => {
			suite.testResults.sort((a, b) =>
				utils.sortAlphabetically({
					a: a.ancestorTitles.join(' '),
					b: b.ancestorTitles.join(' '),
				}));
		});
		return sorted;
	}
	return suiteResults;
};

/**
 * Sorts test suite results with the given method
 * @param {Object} testData
 * @param {String} sortMethod
 */
const sortSuiteResults = ({ testData, sortMethod }) => {
	if (sortMethod) {
		switch (sortMethod.toLowerCase()) {
			case 'status':
				return byStatus(testData);
			case 'executiondesc':
				return byExecutionDesc(testData);
			case 'executionasc':
				return byExecutionAsc(testData);
			case 'titledesc':
				return byTitleDesc(testData);
			case 'titleasc':
				return byTitleAsc(testData);
			default:
				return testData;
		}
	}
	return testData;
};

module.exports = {
	sortSuiteResults,
};
});

var sorting_1 = sorting.sortSuiteResults;

//! pretty-print-json v0.0.6 ~ github.com/center-key/pretty-print-json ~ MIT License

const prettyPrintJson = {

   version: '0.0.6',

   toHtml: (thing) => {
      const htmlEntities = (string) => {
         // Makes text displayable in browsers
         return string
            .replace(/&/g,   '&amp;')
            .replace(/\\"/g, '&bsol;&quot;')
            .replace(/</g,   '&lt;')
            .replace(/>/g,   '&gt;');
         };
      const replacer = (match, p1, p2, p3, p4) => {
         // Converts the four parenthesized capture groups (indent, key, value, end) into HTML
         const part =       { indent: p1, key: p2, value: p3, end: p4 };
         const key =        '<span class=json-key>';
         const val =        '<span class=json-value>';
         const bool =       '<span class=json-boolean>';
         const str =        '<span class=json-string>';
         const isBool =     ['true', 'false'].includes(part.value);
         const valSpan =    /^"/.test(part.value) ? str : isBool ? bool : val;
         const findName =   /"([\w]+)": |(.*): /;
         const indentHtml = part.indent || '';
         const keyHtml =    part.key ? key + part.key.replace(findName, '$1$2') + '</span>: ' : '';
         const valueHtml =  part.value ? valSpan + part.value + '</span>' : '';
         const endHtml =    part.end || '';
         return indentHtml + keyHtml + valueHtml + endHtml;
         };
      const jsonLine = /^( *)("[^"]+": )?("[^"]*"|[\w.+-]*)?([{}[\],]*)?$/mg;
      // Regex parses each line of the JSON string into four parts:
      //    Capture group       Part        Description                  '   "active": true,'
      //    ------------------  ----------  ---------------------------  --------------------
      //    ( *)                p1: indent  Spaces for indentation       '   '
      //    ("[^"]+": )         p2: key     Key name                     '"active": '
      //    ("[^"]*"|[\w.+-]*)  p3: value   Key value                    'true'
      //    ([{}[\],]*)         p4: end     Line termination characters  ','
      return htmlEntities(JSON.stringify(thing, null, 3)).replace(jsonLine, replacer);
      }

   };

if (typeof module === 'object')
   module.exports = prettyPrintJson;  //node module loading system (CommonJS)
if (typeof window === 'object')
   window.prettyPrintJson = prettyPrintJson;  //support both global and window property


var prettyPrintJson$1 = Object.freeze({

});

var prettyPrintJson$2 = ( prettyPrintJson$1 && undefined ) || prettyPrintJson$1;

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
			metaDataContainer.ele('div', { id: 'timestamp' }, `Start: ${dateformat(timestamp, this.config.getDateFormat())}`);
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
									logElementPrev.raw(prettyPrintJson$2.toHtml(c || log.message));
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

var reportGenerator = ReportGenerator;

var config_1 = createCommonjsModule(function (module) {
// Initialize an empty config object
const config = {};

/**
 * Assigns the given data to the config object
 * @param {Object} data
 */
const setConfigData = data => Object.assign(config, data);

const setup = () => {
	// Attempt to locate and assign configurations from jesthtmlreporter.config.json
	try {
		const jesthtmlreporterconfig = fs.readFileSync(path.join(process.cwd(), 'jesthtmlreporter.config.json'), 'utf8');
		if (jesthtmlreporterconfig) {
			return setConfigData(JSON.parse(jesthtmlreporterconfig));
		}
	} catch (e) { /** do nothing */ }
	// Attempt to locate and assign configurations from package.json
	try {
		const packageJson = fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8');
		if (packageJson) {
			return setConfigData(JSON.parse(packageJson)['jest-html-reporter']);
		}
	} catch (e) { /** do nothing */ }
	return config;
};

/**
 * Returns the output path for the test report
 * @return {String}
 */
const getOutputFilepath = () =>
	process.env.JEST_HTML_REPORTER_OUTPUT_PATH || config.outputPath || path.join(process.cwd(), 'test-report.html');

/**
 * Returns the configured name of theme to be used for styling the report
 * @return {String}
 */
const getTheme = () =>
	process.env.JEST_HTML_REPORTER_THEME || config.theme || 'defaultTheme';

/**
 * Returns the style-override path for the test report
 * @return {String}
 */
const getStylesheetFilepath = () =>
	process.env.JEST_HTML_REPORTER_STYLE_OVERRIDE_PATH || config.styleOverridePath || path.join(__dirname, `../style/${getTheme()}.css`);

/**
 * Returns the Custom Script path that should be injected into the test report
 * @return {String}
 */
const getCustomScriptFilepath = () =>
	process.env.JEST_HTML_REPORTER_CUSTOM_SCRIPT_PATH || config.customScriptPath || null;

/**
 * Returns the configured test report title
 * @return {String}
 */
const getPageTitle = () =>
	process.env.JEST_HTML_REPORTER_PAGE_TITLE || config.pageTitle || 'Test report';

/**
 * Returns the configured logo image path
 * @return {String}
 */
const getLogo = () =>
	process.env.JEST_HTML_REPORTER_LOGO || config.logo || null;

/**
 * Returns whether the report should contain failure messages or not
 * @return {Boolean}
 */
const shouldIncludeFailureMessages = () =>
	process.env.JEST_HTML_REPORTER_INCLUDE_FAILURE_MSG || config.includeFailureMsg || false;

/**
 * Returns whether the report should contain console.logs or not
 * @return {Boolean}
 */
const shouldIncludeConsoleLog = () =>
	process.env.JEST_HTML_REPORTER_INCLUDE_CONSOLE_LOG || config.includeConsoleLog || false;

/**
 * Returns whether the report should use a dedicated .css file
 * @return {Boolean}
 */
const shouldUseCssFile = () =>
	process.env.JEST_HTML_REPORTER_USE_CSS_FILE || config.useCssFile || false;

/**
 * Returns the configured threshold (in seconds) when to apply a warning
 * @return {Number}
 */
const getExecutionTimeWarningThreshold = () =>
	process.env.JEST_HTML_REPORTER_EXECUTION_TIME_WARNING_THRESHOLD || config.executionTimeWarningThreshold || 5;

/**
 * Returns the configured date/time format.
 * Uses DateFormat - https://github.com/felixge/node-dateformat
 * @return {String}
 */
const getDateFormat = () =>
	process.env.JEST_HTML_REPORTER_DATE_FORMAT || config.dateFormat || 'yyyy-mm-dd HH:MM:ss';

/**
 * Returns the configured sorting method
 * @return {String}
 */
const getSort = () =>
	process.env.JEST_HTML_REPORTER_SORT || config.sort || 'default';

module.exports = {
	config,
	setup,
	setConfigData,
	getOutputFilepath,
	getStylesheetFilepath,
	getCustomScriptFilepath,
	getPageTitle,
	getLogo,
	shouldIncludeFailureMessages,
	shouldIncludeConsoleLog,
	shouldUseCssFile,
	getExecutionTimeWarningThreshold,
	getTheme,
	getDateFormat,
	getSort,
};
});

var config_2 = config_1.config;
var config_3 = config_1.setup;
var config_4 = config_1.setConfigData;
var config_5 = config_1.getOutputFilepath;
var config_6 = config_1.getStylesheetFilepath;
var config_7 = config_1.getCustomScriptFilepath;
var config_8 = config_1.getPageTitle;
var config_9 = config_1.getLogo;
var config_10 = config_1.shouldIncludeFailureMessages;
var config_11 = config_1.shouldIncludeConsoleLog;
var config_12 = config_1.shouldUseCssFile;
var config_13 = config_1.getExecutionTimeWarningThreshold;
var config_14 = config_1.getTheme;
var config_15 = config_1.getDateFormat;
var config_16 = config_1.getSort;

function JestHtmlReporter(globalConfig, options) {
	// Initiate the config and setup the Generator class
	config_1.setup();
	const reportGenerator$$1 = new reportGenerator(config_1);

	/**
	 * If the first parameter has a property named 'testResults',
	 * the script is being run as a 'testResultsProcessor'.
	 * We then need to return the test results as they were received from Jest
	 * https://facebook.github.io/jest/docs/en/configuration.html#testresultsprocessor-string
	 */
	if (Object.prototype.hasOwnProperty.call(globalConfig, 'testResults')) {
		// Generate Report
		reportGenerator$$1.generate({ data: globalConfig });
		// Return the results as required by Jest
		return globalConfig;
	}

	/**
	 * The default behaviour - run as Custom Reporter, in parallel with Jest.
	 * This should eventually be turned into a proper class (whenever the testResultsProcessor option is phased out)
	 * https://facebook.github.io/jest/docs/en/configuration.html#reporters-array-modulename-modulename-options
	 */
	this.jestConfig = globalConfig;
	this.jestOptions = options;

	this.onRunComplete = (contexts, testResult) => {
		// Apply the configuration within jest.config.json to the current config
		config_1.setConfigData(this.jestOptions);
		// Apply the updated config
		reportGenerator$$1.config = config_1;
		// Generate Report
		return reportGenerator$$1.generate({ data: testResult });
	};
}

var src = JestHtmlReporter;

module.exports = src;
