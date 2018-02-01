const JestHTMLReporter = require('../src');
const mockdata = require('./_mockdata');

describe('index', () => {
	it('should return the jest test data', () => {
		expect(JestHTMLReporter(mockdata.jestTestData))
			.toEqual(mockdata.jestTestData);
	});
});
