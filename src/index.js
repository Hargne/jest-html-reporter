const methods = require('./methods');

class HtmlReporter {
    constructor(globalConfig, options) {
        this._globalConfig = globalConfig;
        this._options = options;
    }

    onRunComplete(contexts, results) {
        const destination = methods.getOutputFilepath();
        // Generate Report
        return methods.createReport(results, destination);
    }
}

module.exports = HtmlReporter;