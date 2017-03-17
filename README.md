# jest-html-reporter
A [jest](https://github.com/facebook/jest) test results processor for generating a summary in HTML. This plugin will generate a test summary file in HTML.

This plugin was inspired by [karma-htmlfile-reporter](https://github.com/matthias-schuetz/karma-htmlfile-reporter)
## Installation
```shell
npm install jest-html-reporter
```

## Usage
You must configure jest to process the test results by adding the following entry to the jest config:
```JSON
{
	"testResultsProcessor": "./node_modules/jest-html-reporter"
}
```
Then when you run jest from within the terminal, a file called test-report.html will be created within your root folder containing general information about your tests.

## Configuration
The configurations are done directly within your package.json file
```JSON
{
	...
	"jest-html-reporter": {
		"pageTitle": "Your test suite",
		"output": "test-report/index.html"
	}
}
```
