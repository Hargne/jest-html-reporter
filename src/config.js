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

/**
 * Returns the configured sorting method
 * @return {String}
 */
const getStable = () =>
	process.env.JEST_HTML_REPORTER_STABLE || config.stable || false;

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
	getStable,
};
