<p align="center">
	<h3 align="center">jest-html-reporter</h3>
	<p align="center">
		A <a href="https://github.com/facebook/jest">Jest</a> test results processor for generating a summary in HTML.
		<br>
		<a href="https://github.com/Hargne/jest-html-reporter/wiki"><strong>Documentation »</strong></a>
		<br />
		<br />
		<img src="https://nodei.co/npm/jest-html-reporter.png?downloads=true&stars=true" alt="">
		<br />
		<br />
		<img src="https://travis-ci.org/Hargne/jest-html-reporter.svg?branch=master">
		<br />
		<br />
		Inspired by <a href="https://github.com/matthias-schuetz/karma-htmlfile-reporter">karma-htmlfile-reporter</a>
		<br />
		<br />
		<hr />
		<img src="https://user-images.githubusercontent.com/3501024/36374670-711b7cea-156c-11e8-8b7b-7fc5f38b1866.png" alt="">
	</p>
</p>

***

## Installation
```shell
npm install jest-html-reporter --save-dev
```

## Usage
Configure Jest to process the test results by adding the following entry to the Jest config (jest.config.js):
```JSON
{
	"testResultsProcessor": "./node_modules/jest-html-reporter"
}
```
Then when you run Jest from within the terminal, a file called *test-report.html* will be created within your root folder containing information about your tests.

#### Alternative usage with package.json
Although jest.config.js is specifically created for configuring Jest (and not this plugin), it is possible to configure Jest from within package.json by adding the following as a new line:
```JSON
"jest": {"testResultsProcessor": "./node_modules/jest-html-reporter" }
```

### Run as a Custom Reporter
It is also possible to run jest-html-reporter as a custom reporter within Jest. This allows the plugin to be run in parallel with Jest instead of after a test run, and will guarantee that the test report is generated even if Jest is run with options such as `--forceExit`.

Add the following entry to the Jest config (jest.config.js):

```JSON
"reporters": ["default", "./node_modules/jest-html-reporter"]
```
Please note that you need to add the `"executionMode": "reporter"` configuration within jesthtmlreporter.config.json in order for this to work (more information on configuration can be found within the [documentation](https://github.com/Hargne/jest-html-reporter/wiki/configuration)).


## Node Compatibility
This plugin is compatible with Node version `^4.8.3`

---

## Configuration
To configure this plugin, create a file named `jesthtmlreporter.config.json` in the root folder of the project. Please note that all configuration properties are optional.

| Property | Type | Description | Default
|--|--|--|--|
| `pageTitle` | `STRING` | The title of the document. This string will also be outputted on the top of the page. | `"Test Suite"`
| `outputPath` | `STRING` | The path to where the plugin will output the HTML report. The path must include the filename and end with .html | `"./test-report.html"`
| `includeFailureMsg` | `BOOLEAN` | If this setting is set to true, this will output the detailed failure message for each failed test. | `false`
| `styleOverridePath` | `STRING` | The path to a file containing CSS styles that should override the default styling.* | `null`
| `theme` | `STRING` | The name of the reporter themes to use when rendering the report. You can find the available themes in the [Documentation](https://github.com/Hargne/jest-html-reporter/wiki/Test-Report-Themes) | `"defaultTheme"`
| `logo` | `STRING` | Path to a logo that will be included in the header of the report | `null`
| `executionTimeWarningThreshold` | `NUMBER` | The threshold for test execution time (in seconds) in each test suite that will render a warning on the report page. 5 seconds is the default timeout in Jest. | `5`
| `dateFormat` | `STRING` | The format in which date/time should be formatted in the test report. Have a look in the [Documentation](https://github.com/Hargne/jest-html-reporter/wiki/Date-Format) for the available date format variables. | `"yyyy-mm-dd HH:MM:ss"`
| `sort` | `STRING` | Sorts the test results with the given method. Available methods are: `"default"`, `"status"` More information can be found in the [Documentation](https://github.com/Hargne/jest-html-reporter/wiki/Sorting-Methods). | `"default"`
| `executionMode` | `STRING` | Defines the execution mode. Avaiable modes are: `reporter`, `testResultsProcessor` | `"testResultsProcessor"`

#### *A note on styleOverridePath
The plugin will search for the file from the root directory, therefore there is no need to prepend the string with `./` or `../`. Please have a look at the default styling (located within *style/defaultTheme.css*) for a reference of the elements available for styling.

### Example Configuration

```
{
	"pageTitle": "Your test suite",
	"outputPath": "test-report/index.html",
	"includeFailureMsg": true,
	"styleOverridePath": "src/teststyle.css"
}
```

#### Alternative configuration with package.json
Add an entry named *"jest-html-reporter"* to your package.json 
```
{
	...
	"jest-html-reporter": {
		"pageTitle": "Your test suite",
		"outputPath": "test-report.html",
		"includeFailureMsg": true
	}
}
```

---

## Continuous Integration

Configuration may also be performed with environment variables for dynamic file saving paths in different environments. ***NOTE:** Environment variables will take precedence over configurations set in jesthtmlreporter.config.json and package.json*

### Example
Here is an example of dynamically naming your output file and test report title to match your current branch that one might see in a automated deployment pipeline before running their tests.

```bash
export BRANCH_NAME=`git symbolic-ref HEAD 2>/dev/null | cut -d"/" -f 3`
export JEST_HTML_REPORTER_OUTPUT_PATH=/home/username/jest-test-output/test-reports/"$BRANCH_NAME".html
export JEST_HTML_REPORTER_PAGE_TITLE="$BRANCH_NAME"\ Test\ Report
```

### Configuration Environment Variables
The environment variables reflect the properties set in the JSON configuration file. Please read the [documentation](https://github.com/Hargne/jest-html-reporter/wiki/configuration#configuration-environment-variables) for more information on these variables.

