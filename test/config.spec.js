const config = require('../src/config');

describe('config', () => {
	beforeEach(() => {
		// Reset the mocked modules prior to each test case
		jest.resetModules();
	});

	afterEach(() => {
		delete process.env.JEST_HTML_REPORTER_OUTPUT_PATH;
	});

	describe('getOutputFilepath', () => {
		it('should return the value from package.json or jesthtmlreporter.config.json', () => {
			config.setConfigData({ outputPath: 'test-report.html' });
			expect(config.getOutputFilepath()).toEqual('test-report.html');
		});
		it('should return the environment variable', () => {
			config.setConfigData({});
			process.env.JEST_HTML_REPORTER_OUTPUT_PATH = 'setInEnv.html';
			expect(config.getOutputFilepath()).toEqual('setInEnv.html');
		});
	});
});
