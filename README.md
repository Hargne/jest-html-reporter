<p align="center">
	<h3 align="center">jest-html-reporter</h3>
	<p align="center">
		A <a href="https://github.com/facebook/jest">Jest</a> test results processor for generating a summary in HTML.
		<br>
		<a href="https://github.com/Hargne/jest-html-reporter/wiki"><strong>Documentation »</strong></a>
		<br />
		<br />
		<img src="https://img.shields.io/npm/dm/jest-html-reporter?style=for-the-badge" alt="">
		<img src="https://img.shields.io/travis/com/hargne/jest-html-reporter?style=for-the-badge">
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
Configure Jest to process the test results by adding the following entry to the Jest config (jest.config.json):
```JSON
"reporters": [
	"default",
	["./node_modules/jest-html-reporter", {
		"pageTitle": "Test Report"
	}]
]
```
As you run Jest from within the terminal, a file called *test-report.html* will be created within your root folder containing information about your tests.

There are multiple configuration options available. To read more about these, please refer to the [documentation](https://github.com/Hargne/jest-html-reporter/wiki/configuration).

### Alternative Usage as a Test Results Processor
To run the reporter as a test results processor (after Jest is complete instead of running in parallel), add the following entry to the Jest config (jest.config.json):
```JSON
{
	"testResultsProcessor": "./node_modules/jest-html-reporter"
}
```

**Note:** When running as a testResultsProcessor, the configuration needs be placed  within a new file named `jesthtmlreporter.config.json` residing in the root folder.
More information about this can be found in the [documentation](https://github.com/Hargne/jest-html-reporter/wiki/configuration).


## Node Compatibility
This plugin is compatible with Node version `^4.8.3`

---

## Configuration
Please note that all configuration properties are optional.

| Property | Type | Description | Default
|--|--|--|--|
| `pageTitle` | `STRING` | The title of the document. This string will also be outputted on the top of the page. | `"Test Suite"`
| `outputPath` | `STRING` | The path to where the plugin will output the HTML report. The path must include the filename and end with .html | `"./test-report.html"`
| `includeFailureMsg` | `BOOLEAN` | If this setting is set to true, this will output the detailed failure message for each failed test. | `false`
| `includeConsoleLog` | `BOOLEAN` | If set to true, this will output all triggered console logs for each test suite. | `false`
| `styleOverridePath` | `STRING` | The path to a file containing CSS styles that should override the default styling.* | `null`
| `useCssFile` | `BOOLEAN` | If set to true, the CSS styles will link in the current theme's .css file instead of inlining its content on the page | `false`
| `customScriptPath` | `STRING` | Path to a javascript file that should be injected into the test report | `null`
| `theme` | `STRING` | The name of the reporter themes to use when rendering the report. You can find the available themes in the [documentation](https://github.com/Hargne/jest-html-reporter/wiki/Test-Report-Themes) | `"defaultTheme"`
| `logo` | `STRING` | Path to a logo that will be included in the header of the report | `null`
| `executionTimeWarningThreshold` | `NUMBER` | The threshold for test execution time (in seconds) in each test suite that will render a warning on the report page. 5 seconds is the default timeout in Jest. | `5`
| `dateFormat` | `STRING` | The format in which date/time should be formatted in the test report. Have a look in the [documentation](https://github.com/Hargne/jest-html-reporter/wiki/Date-Format) for the available date format variables. | `"yyyy-mm-dd HH:MM:ss"`
| `sort` | `STRING` | Sorts the test results using the given method. Available sorting methods can be found in the [documentation](https://github.com/Hargne/jest-html-reporter/wiki/Sorting-Methods). | `"default"`
| `statusIgnoreFilter` | `STRING` | A comma-separated string of the test result statuses that should be ignored when rendering the report. Available statuses are: `"passed"`, `"pending"`, `"failed"` | `null`
| `boilerplate` | `STRING` | The path to a boilerplate file that should be used to render the body of the test results into. `{jesthtmlreporter-content}` within the boilerplate will be replaced with the test results | `null`
| `append` | `BOOLEAN` | If set to true, new test results will be appended to the existing test report | `false`

> *The plugin will search for the *styleOverridePath* from the root directory, therefore there is no need to prepend the string with `./` or `../` - You can read more about the themes in the [documentation](https://github.com/Hargne/jest-html-reporter/wiki/Test-Report-Themes).

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
The environment variables reflect the configuration options available in JSON format. Please read the [documentation](https://github.com/Hargne/jest-html-reporter/wiki/configuration#configuration-environment-variables) for more information on these variables.

