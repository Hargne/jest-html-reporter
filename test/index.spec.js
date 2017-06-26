const index = require('../index');
const _mockdata = require('./_mockdata');

describe('index', () => {
	it('should return the jest test data', () => {
		expect(index(_mockdata.jestTestData)).toEqual(_mockdata.jestTestData);
	});
});
