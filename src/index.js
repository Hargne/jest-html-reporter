const methods = require('./methods');

class HtmlReporter {
    onRunComplete(contexts, results) {
		return methods.createReport(results);
    }
}

module.exports = HtmlReporter;
