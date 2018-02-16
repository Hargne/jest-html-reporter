const path = require('path');
const fs = require('fs');
// Initialize an empty config object
const config = {};

/**
 * Assigns the given data to the config object
 * @param {Object} data
 */
const setConfigData = data => Object.assign(config, data);

const setup = () => {
	// Attempt to locate and assign configurations from package.json
	try {
		const packageJson = fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8');
		if (packageJson) {
			setConfigData(JSON.parse(packageJson)['jest-html-reporter']);
		}
	} catch (e) { /** do nothing */ }
	// Attempt to locate and assign configurations from jesthtmlreporter.config.json
	try {
		const jesthtmlreporterconfig = fs.readFileSync(path.join(process.cwd(), 'jesthtmlreporter.config.json'), 'utf8');
		if (jesthtmlreporterconfig) {
			setConfigData(JSON.parse(jesthtmlreporterconfig));
		}
	} catch (e) { /** do nothing */ }
};

/**
 * Returns the output path for the test report
 * @return {String}
 */
const getOutputFilepath = () =>
	config.outputPath || process.env.JEST_HTML_REPORTER_OUTPUT_PATH || path.join(process.cwd(), 'test-report.html');

/**
 * Returns the configured name of theme to be used for styling the report
 * @return {String}
 */
const getTheme = () =>
	config.theme || process.env.JEST_HTML_REPORTER_THEME || 'defaultTheme';

/**
 * Returns the style-override path for the test report
 * @return {String}
 */
const getStylesheetFilepath = () =>
	config.styleOverridePath || process.env.JEST_HTML_REPORTER_STYLE_OVERRIDE_PATH || path.join(__dirname, `../style/${getTheme()}.css`);

/**
 * Returns the configured test report title
 * @return {String}
 */
const getPageTitle = () =>
	config.pageTitle || process.env.JEST_HTML_REPORTER_PAGE_TITLE || 'Test report';

/**
 * Returns whether the report should contain failure messages or not
 * @return {Boolean}
 */
const shouldIncludeFailureMessages = () =>
	config.includeFailureMsg || process.env.JEST_HTML_REPORTER_INCLUDE_FAILURE_MSG || false;

/**
 * Returns the configured threshold (in seconds) when to apply a warning
 * @return {Number}
 */
const getExecutionTimeWarningThreshold = () =>
	config.executionTimeWarningThreshold || process.env.JEST_HTML_REPORTER_EXECUTION_TIME_WARNING_THRESHOLD || 5;

/**
 * Returns the configured date/time format.
 * Uses DateFormat - https://github.com/felixge/node-dateformat
 * @return {String}
 */
const getDateFormat = () =>
	config.dateFormat || process.env.JEST_HTML_REPORTER_DATE_FORMAT || 'yyyy-mm-dd HH:MM:ss';

/**
 * Returns the configured sorting method
 * @return {String}
 */
const getSort = () =>
	config.sort || process.env.JEST_HTML_REPORTER_SORT || 'default';

/**
 * Returns the whether to use the Jest's 'testResultsProcessor' or 'reporters'
 * @return {Boolean}
 */
const useAsReporter = () =>
	config.useAsReporter || process.env.JEST_HTML_USE_AS_REPORTER || false;

module.exports = {
	config,
	setup,
	setConfigData,
	getOutputFilepath,
	getStylesheetFilepath,
	getPageTitle,
	shouldIncludeFailureMessages,
	getExecutionTimeWarningThreshold,
	getTheme,
	getDateFormat,
	getSort,
	useAsReporter,
};
