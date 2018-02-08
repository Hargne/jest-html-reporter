/**
 * Splits test suites apart based on individual test status and sorts by that status:
 * 1. Pending
 * 2. Failed
 * 3. Passed
 * @param {Object} suiteResults
 */
const sortSuiteResultsByStatus = (suiteResults) => {
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
 * Sorts test suite results
 * If sort is undefined or is not a supported value this has no effect
 * @param {Object} suiteResults
 * @param {String} sort The configured sort
 */
const sortSuiteResults = (suiteResults, sort) => {
	if (sort === 'status') {
		return sortSuiteResultsByStatus(suiteResults);
	}

	return suiteResults;
};

module.exports = {
	sortSuiteResults,
	sortSuiteResultsByStatus,
};
