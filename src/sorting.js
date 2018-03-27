const utils = require('./utils');

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
