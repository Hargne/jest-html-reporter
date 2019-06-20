/* eslint-disable global-require */
const path = require('path');
// Mock FS
jest.mock('fs', () => ({ readFileSync: jest.fn() }));
const fs = require('fs');
const config = require('../src/config');

describe('config', () => {
	afterEach(() => {
		config.setConfigData({
			outputPath: null,
			theme: null,
			boilerplate: null,
			styleOverridePath: null,
			pageTitle: null,
			logo: null,
			includeFailureMsg: null,
			includeConsoleLog: null,
			executionTimeWarningThreshold: null,
			dateFormat: null,
			sort: null,
			executionMode: null,
			statusIgnoreFilter: null,
			dispayTestInvocations: null,
		});
		delete process.env.JEST_HTML_REPORTER_OUTPUT_PATH;
		delete process.env.JEST_HTML_REPORTER_THEME;
		delete process.env.JEST_HTML_REPORTER_BOILERPLATE;
		delete process.env.JEST_HTML_REPORTER_STYLE_OVERRIDE_PATH;
		delete process.env.JEST_HTML_REPORTER_PAGE_TITLE;
		delete process.env.JEST_HTML_REPORTER_LOGO;
		delete process.env.JEST_HTML_REPORTER_INCLUDE_FAILURE_MSG;
		delete process.env.JEST_HTML_REPORTER_INCLUDE_CONSOLE_LOG;
		delete process.env.JEST_HTML_REPORTER_EXECUTION_TIME_WARNING_THRESHOLD;
		delete process.env.JEST_HTML_REPORTER_DATE_FORMAT;
		delete process.env.JEST_HTML_REPORTER_SORT;
		delete process.env.JEST_HTML_REPORTER_EXECUTION_MODE;
		delete process.env.JEST_HTML_REPORTER_STATUS_FILTER;
		delete process.env.DISPLAY_TEST_INVOCATIONS;
	});

	describe('setup', () => {
		it('should fetch configurations from jesthtmlreporter.config.json', () => {
			fs.readFileSync.mockReturnValue('{ "pageTitle": "Test Suite Report" }');
			const setupResponse = config.setup();
			expect(setupResponse).toEqual({ pageTitle: 'Test Suite Report' });
		});
	});

	describe('getOutputFilepath', () => {
		it('should return the value from package.json or jesthtmlreporter.config.json', () => {
			config.setConfigData({ outputPath: 'setInJson.html' });
			expect(config.getOutputFilepath()).toEqual('setInJson.html');
		});
		it('should return the environment variable', () => {
			process.env.JEST_HTML_REPORTER_OUTPUT_PATH = 'setInEnv.html';
			expect(config.getOutputFilepath()).toEqual('setInEnv.html');
		});
		it('should return the default value if no setting was provided', () => {
			const expectedOutput = path.join(process.cwd(), 'test-report.html');
			expect(config.getOutputFilepath()).toEqual(expectedOutput);
		});
	});

	describe('getTheme', () => {
		it('should return the value from package.json or jesthtmlreporter.config.json', () => {
			config.setConfigData({ theme: 'setInJson' });
			expect(config.getTheme()).toEqual('setInJson');
		});
		it('should return the environment variable', () => {
			process.env.JEST_HTML_REPORTER_THEME = 'setInEnv';
			expect(config.getTheme()).toEqual('setInEnv');
		});
		it('should return the default value if no setting was provided', () => {
			expect(config.getTheme()).toEqual('defaultTheme');
		});
	});

	describe('getStylesheetFilepath', () => {
		it('should return the value from package.json or jesthtmlreporter.config.json', () => {
			config.setConfigData({ styleOverridePath: 'setInJson' });
			expect(config.getStylesheetFilepath()).toEqual('setInJson');
		});
		it('should return the environment variable', () => {
			process.env.JEST_HTML_REPORTER_STYLE_OVERRIDE_PATH = 'setInEnv';
			expect(config.getStylesheetFilepath()).toEqual('setInEnv');
		});
		it('should return the default value if no setting was provided', () => {
			const expectedOutput = path.join(process.cwd(), 'style/defaultTheme.css');
			expect(config.getStylesheetFilepath()).toEqual(expectedOutput);
		});
	});

	describe('getPageTitle', () => {
		it('should return the value from package.json or jesthtmlreporter.config.json', () => {
			config.setConfigData({ pageTitle: 'setInJson' });
			expect(config.getPageTitle()).toEqual('setInJson');
		});
		it('should return the environment variable', () => {
			process.env.JEST_HTML_REPORTER_PAGE_TITLE = 'setInEnv';
			expect(config.getPageTitle()).toEqual('setInEnv');
		});
		it('should return the default value if no setting was provided', () => {
			expect(config.getPageTitle()).toEqual('Test report');
		});
	});

	describe('getLogo', () => {
		it('should return the value from package.json or jesthtmlreporter.config.json', () => {
			config.setConfigData({ logo: 'logoFromJson.png' });
			expect(config.getLogo()).toEqual('logoFromJson.png');
		});
		it('should return the environment variable', () => {
			process.env.JEST_HTML_REPORTER_LOGO = 'logoFromEnv.png';
			expect(config.getLogo()).toEqual('logoFromEnv.png');
		});
		it('should return the default value if no setting was provided', () => {
			expect(config.getLogo()).toBeNull();
		});
	});

	describe('shouldIncludeFailureMessages', () => {
		it('should return the value from package.json or jesthtmlreporter.config.json', () => {
			config.setConfigData({ includeFailureMsg: true });
			expect(config.shouldIncludeFailureMessages()).toEqual(true);
		});
		it('should return the environment variable', () => {
			process.env.JEST_HTML_REPORTER_INCLUDE_FAILURE_MSG = true;
			expect(config.shouldIncludeFailureMessages()).toEqual('true');
		});
		it('should return the default value if no setting was provided', () => {
			expect(config.shouldIncludeFailureMessages()).toEqual(false);
		});
	});

	describe('shouldIncludeConsoleLog', () => {
		it('should return the value from package.json or jesthtmlreporter.config.json', () => {
			config.setConfigData({ includeConsoleLog: true });
			expect(config.shouldIncludeConsoleLog()).toEqual(true);
		});
		it('should return the environment variable', () => {
			process.env.JEST_HTML_REPORTER_INCLUDE_CONSOLE_LOG = true;
			expect(config.shouldIncludeConsoleLog()).toEqual('true');
		});
		it('should return the default value if no setting was provided', () => {
			expect(config.shouldIncludeConsoleLog()).toEqual(false);
		});
	});

	describe('getExecutionTimeWarningThreshold', () => {
		it('should return the value from package.json or jesthtmlreporter.config.json', () => {
			config.setConfigData({ executionTimeWarningThreshold: 10 });
			expect(config.getExecutionTimeWarningThreshold()).toEqual(10);
		});
		it('should return the environment variable', () => {
			process.env.JEST_HTML_REPORTER_EXECUTION_TIME_WARNING_THRESHOLD = 8;
			expect(config.getExecutionTimeWarningThreshold()).toEqual('8');
		});
		it('should return the default value if no setting was provided', () => {
			expect(config.getExecutionTimeWarningThreshold()).toEqual(5);
		});
	});

	describe('getDateFormat', () => {
		it('should return the value from package.json or jesthtmlreporter.config.json', () => {
			config.setConfigData({ dateFormat: 'yyyy' });
			expect(config.getDateFormat()).toEqual('yyyy');
		});
		it('should return the environment variable', () => {
			process.env.JEST_HTML_REPORTER_DATE_FORMAT = 'yymmdd';
			expect(config.getDateFormat()).toEqual('yymmdd');
		});
		it('should return the default value if no setting was provided', () => {
			expect(config.getDateFormat()).toEqual('yyyy-mm-dd HH:MM:ss');
		});
	});

	describe('getSort', () => {
		it('should return the value from package.json or jesthtmlreporter.config.json', () => {
			config.setConfigData({ sort: 'setInJson' });
			expect(config.getSort()).toEqual('setInJson');
		});
		it('should return the environment variable', () => {
			process.env.JEST_HTML_REPORTER_SORT = 'setInEnv';
			expect(config.getSort()).toEqual('setInEnv');
		});
		it('should return the default value if no setting was provided', () => {
			expect(config.getSort()).toEqual('default');
		});
	});

	describe('getBoilerplatePath', () => {
		it('should return the value from package.json or jesthtmlreporter.config.json', () => {
			config.setConfigData({ boilerplate: 'setInJson' });
			expect(config.getBoilerplatePath()).toEqual('setInJson');
		});
		it('should return the environment variable', () => {
			process.env.JEST_HTML_REPORTER_BOILERPLATE = 'setInEnv';
			expect(config.getBoilerplatePath()).toEqual('setInEnv');
		});
		it('should return the default value if no setting was provided', () => {
			expect(config.getBoilerplatePath()).toBeNull();
		});
	});

	describe('getStatusIgnoreFilter', () => {
		it('should return the value from package.json or jesthtmlreporter.config.json', () => {
			config.setConfigData({ statusIgnoreFilter: 'setInJson' });
			expect(config.getStatusIgnoreFilter()).toEqual('setInJson');
		});
		it('should return the environment variable', () => {
			process.env.JEST_HTML_REPORTER_STATUS_FILTER = 'setInEnv';
			expect(config.getStatusIgnoreFilter()).toEqual('setInEnv');
		});
		it('should return the default value if no setting was provided', () => {
			expect(config.getStatusIgnoreFilter()).toBeNull();
		});
	});

	describe('displayInvocations', () => {
		it('should return the value from package.json or jesthtmlreporter.config.json', () => {
			config.setConfigData({ dispayTestInvocations: true });
			expect(config.displayInvocations()).toEqual(true);
		});
		it('should return the environment variable', () => {
			process.env.DISPLAY_TEST_INVOCATIONS = true;
			expect(config.displayInvocations()).toEqual('true');
		});
		it('should return the default value if no setting was provided', () => {
			expect(config.displayInvocations()).toEqual(false);
		});
	});
});
