/* eslint-disable global-require */
const path = require('path');
jest.mock('cosmiconfig');
const cosmiconfig = require('cosmiconfig');
const config = require('../src/config');

const mockCosmiconfigWith = result => {
  cosmiconfig.mockImplementationOnce(() => ({
    searchSync: () => result
  }));
}

describe('config', () => {
	afterEach(() => {
		config.setConfigData({
			outputPath: null,
			theme: null,
			styleOverridePath: null,
			pageTitle: null,
			logo: null,
			includeFailureMsg: null,
			includeConsoleLog: null,
			executionTimeWarningThreshold: null,
			dateFormat: null,
			sort: null,
			executionMode: null,
		});
		delete process.env.JEST_HTML_REPORTER_OUTPUT_PATH;
		delete process.env.JEST_HTML_REPORTER_THEME;
		delete process.env.JEST_HTML_REPORTER_STYLE_OVERRIDE_PATH;
		delete process.env.JEST_HTML_REPORTER_PAGE_TITLE;
		delete process.env.JEST_HTML_REPORTER_LOGO;
		delete process.env.JEST_HTML_REPORTER_INCLUDE_FAILURE_MSG;
		delete process.env.JEST_HTML_REPORTER_INCLUDE_CONSOLE_LOG;
		delete process.env.JEST_HTML_REPORTER_EXECUTION_TIME_WARNING_THRESHOLD;
		delete process.env.JEST_HTML_REPORTER_DATE_FORMAT;
		delete process.env.JEST_HTML_REPORTER_SORT;
		delete process.env.JEST_HTML_REPORTER_EXECUTION_MODE;
	});

	describe('setup', () => {
		it('should load configuration from a package.json property, rc file, or CommonJS module', () => {
			mockCosmiconfigWith({config: {pageTitle: 'Test Suite Report' }})
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
});
