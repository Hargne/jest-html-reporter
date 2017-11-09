# jest-html-reporter
**A [jest](https://github.com/facebook/jest) test results processor for generating a summary in HTML.**

[![NPM](https://nodei.co/npm/jest-html-reporter.png?downloads=true&stars=true)](https://nodei.co/npm/jest-html-reporter/)

![screenshot](https://cloud.githubusercontent.com/assets/3501024/26726395/251055b0-47a3-11e7-9116-99a6a610eda0.png)

This plugin was inspired by [karma-htmlfile-reporter](https://github.com/matthias-schuetz/karma-htmlfile-reporter)

## Installation
```shell
npm install jest-html-reporter
```

## Usage
Configure Jest to process the test results by adding the following entry to the Jest config (jest.config.js):
```JSON
{
	"testResultsProcessor": "./node_modules/jest-html-reporter"
}
```
Then when you run Jest from within the terminal, a file called *test-report.html* will be created within your root folder containing information about your tests.

### Alternative usage with package.json
Although jest.config.js is specifically created for configuring Jest (and not this plugin), it is possible to configure Jest from within package.json by adding the following as a new line:
```JSON
"jest": { "testResultsProcessor": "./node_modules/jest-html-reporter" }
```

## Node Compatibility
This plugin is compatible with Node version `^4.8.3`

## Configuration
The configurations are done directly within your *package.json* file

### pageTitle (string)
*[Default: "Test Suite"]*

The title of the document. This string will also be outputted on the top of the page.

### outputPath (string)
*[Default: "./test-report.html"]*

The path to where the plugin will output the HTML report. The path must include the filename and end with .html

### includeFailureMsg (boolean)
*[Default: false]*

If this setting is set to true, this will output the detailed failure message for each failed test.

### styleOverridePath (string)
*[Default: null]*

The path to a file containing CSS styles that will override the default styling of the report. The plugin will search for the file from the root directory, therefore there is no need to prepend the string with ./ or ../

Have a look at the default styling (located within this repository at *src/style.js*) for a reference to the IDs and classes available for styling.

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

## Continuous Integration

The output path can be set with a environment variable for dynamic file saving paths in different environments. Useful for CI

~~~ bash
export TEST_REPORT_PATH=/home/username/jest-test-output/test-reports.html
~~~
