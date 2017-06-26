# jest-html-reporter
**A [jest](https://github.com/facebook/jest) test results processor for generating a summary in HTML.**

[![NPM](https://nodei.co/npm/jest-html-reporter.png?downloads=true&stars=true)](https://nodei.co/npm/jest-html-reporter/)

This plugin was inspired by [karma-htmlfile-reporter](https://github.com/matthias-schuetz/karma-htmlfile-reporter)

![screenshot](https://cloud.githubusercontent.com/assets/3501024/26726395/251055b0-47a3-11e7-9116-99a6a610eda0.png)

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

### pageTitle (string)
[Default: "Test Suite"]

The title of the document. This string will also be outputted on the top of the page.

### outputPath (string)
[Default: "./test-report.html"]

The path to where the plugin will output the HTML report. The path must include the filename and end with .html

### includeFailureMsg (boolean)
[Default: false]

If this setting is set to true, this will output the detailed failure message for each failed test.

### styleOverridePath (string)
[Default: null]

The path to a file containing CSS styles that will override the default styling of the report. The plugin will search for the file from the root directory, therefore there is no need to prepend the string with ./ or ../

Please refer to the file named *style.js* within the root folder of this plugin for an example of the IDs and classes that are available for styling.

### Example configuration (package.json)
```JSON
{
	...
	"jest-html-reporter": {
		"pageTitle": "Your test suite",
		"outputPath": "test-report/index.html",
		"includeFailureMsg": false,
		"styleOverridePath": "src/teststyle.css"
	}
}
```
