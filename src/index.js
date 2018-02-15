const methods = require('./methods');

class HtmlReporter {
	constructor(globalConfig, options) {
		this.globalConfig = globalConfig;
		this.options = options;
	}
	/* eslint-disable */
	onRunComplete(contexts, results) {
		return methods.createReport(results);
	}
	/* eslint-enable */
}

module.exports = HtmlReporter;
