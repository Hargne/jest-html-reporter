<p align="center">
	<p align="center">📜</p>
	<h3 align="center">jest-html-reporter</h3>
	<p align="center">
		A <a href="https://github.com/facebook/jest">Jest</a> test results processor for generating a summary in HTML.
		<br />
		<br />
		<img src="https://img.shields.io/npm/v/jest-html-reporter?style=flat-square">
		<img src="https://img.shields.io/node/v/jest-html-reporter?style=flat-square">
		<img src="https://img.shields.io/npm/dm/jest-html-reporter?style=flat-square">
		<br />
		<br />
		<small>Inspired by <a href="https://github.com/matthias-schuetz/karma-htmlfile-reporter">karma-htmlfile-reporter</a></small>
		<br />
		<br />
		<div style="text-align:center">
			<img src="https://user-images.githubusercontent.com/3501024/77887991-d511c480-726b-11ea-9ed8-2e581206900c.png" alt="" style="max-width:75%">
		</div>
		<br />
		<br />
	</p>
</p>

## Installation

**npm:**

```
$ npm install jest-html-reporter --save-dev
```

**yarn:**

```
$ yarn add jest-html-reporter --dev
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

As you run Jest from within the terminal, a file called _test-report.html_ will be created within your root folder containing information about your tests.

There are multiple configuration options available. Read more about these further down in this document.

#### Alternative Usage as a Test Results Processor

To run the reporter as a test results processor (after Jest is complete instead of running in parallel), add the following entry to the Jest config (jest.config.json):

```JSON
{
	"testResultsProcessor": "./node_modules/jest-html-reporter"
}
```

**Note:** When running as a testResultsProcessor, the configuration needs either to be placed within a new file named `jesthtmlreporter.config.json` residing in the root folder

```JSON
{
	"pageTitle": "Test Report",
}
```

or via adding a key to `package.json` named "jest-html-reporter":

```JSON
{
	...
	"jest-html-reporter": {
		"pageTitle": "Test Report",
	}
}
```

## 📌 Configuration Options (All Optional)

| Option                              | Type                                       | Default               | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ----------------------------------- | ------------------------------------------ | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **`additionalInformation`**         | `Array<{ label: string; value: string; }>` | `null`                | A list of additional information to be added to the top of the report.                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| **`append`**                        | `boolean`                                  | `false`               | Append test results to an existing report.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| **`boilerplate`**                   | `string`                                   | `null`                | Path to an HTML boilerplate file. The `{jesthtmlreporter-content}` variable will be replaced with test results.                                                                                                                                                                                                                                                                                                                                                                                                                |
| **`collapseSuitesByDefault`**       | `boolean`                                  | `false`               | Collapse test suites (accordions) by default.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| **`customScriptPath`**              | `string`                                   | `null`                | Path to an external script file injected into the report.                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| **`dateFormat`**                    | `string`                                   | `yyyy-mm-dd HH:MM:ss` | Date format for timestamps. See [documentation](https://github.com/Hargne/jest-html-reporter/wiki/Date-Format) for available formats.                                                                                                                                                                                                                                                                                                                                                                                          |
| **`executionTimeWarningThreshold`** | `number`                                   | `5`                   | Warn if a test suite exceeds this execution time (in seconds).                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| **`hideConsoleLogOrigin`**          | `boolean`                                  | `true`                | Hide `console.log` origin (stack trace) in the report (**requires** `--verbose=false`).                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| **`includeConsoleLog`**             | `boolean`                                  | `false`               | Include `console.log` outputs in the report (**requires** `--verbose=false`).                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| **`includeFailureMsg`**             | `boolean`                                  | `false`               | Show detailed error messages for failed tests.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| **`includeStackTrace`**             | `boolean`                                  | `true`                | Show stack traces for failed tests.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| **`includeSuiteFailure`**           | `boolean`                                  | `false`               | Show detailed errors for entire failed test suites.                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| **`includeObsoleteSnapshots`**      | `boolean`                                  | `false`               | Show obsolete snapshot names.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| **`logo`**                          | `string`                                   | `null`                | Path to an image file to display in the report header.                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| **`outputPath`**                    | `string`                                   | `./test-report.html`  | Full path for the output report file (**must end in `.html`**).                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| **`pageTitle`**                     | `string`                                   | `"Test Report"`       | Title of the document and top-level heading.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| **`sort`**                          | `string`                                   | `null`                | Sort test results by a specific method. Available values:<br> ➤ **`status`** → Sorts by test status (**pending → failed → passed**).<br> ➤ **`status:{custom-order}`** → Custom status order (e.g., `"status:failed,passed,pending"`).<br> ➤ **`executionasc`** → Sorts by execution time **ascending**.<br> ➤ **`executiondesc`** → Sorts by execution time **descending**.<br> ➤ **`titleasc`** → Sorts by suite filename/test name **ascending**.<br> ➤ **`titledesc`** → Sorts by suite filename/test name **descending**. |
| **`statusIgnoreFilter`**            | `string`                                   | `null`                | **Comma-separated** list of statuses to exclude: `"passed"`, `"pending"`, `"failed"`.                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| **`styleOverridePath`**             | `string`                                   | `null`                | Path to a CSS file to override default styles.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| **`useCssFile`**                    | `boolean`                                  | `false`               | Link to the CSS file instead of inlining styles.                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| **`theme`**                         | `string`                                   | `defaultTheme`        | Theme that you are able to set to report (defaultTheme or darkTheme)                                                                                                                                                                                                                                                                                                                                                                                                                                                           |

## Continuous Integration

All the configuration options provided in the table above are available via environment variables and follows the pattern of snake case in uppercase prepended with `JEST_HTML_REPORTER_`

**Example:** `customScriptPath` -> `JEST_HTML_REPORTER_CUSTOM_SCRIPT_PATH`

**\*NOTE:** Environment variables will take precedence over configurations set in jesthtmlreporter.config.json and package.json\*

### CI Example

Here is an example of dynamically naming your output file and test report title to match your current branch that one might see in a automated deployment pipeline before running their tests.

```bash
export BRANCH_NAME=`git symbolic-ref HEAD 2>/dev/null | cut -d"/" -f 3`
export JEST_HTML_REPORTER_OUTPUT_PATH=/home/username/jest-test-output/test-reports/"$BRANCH_NAME".html
export JEST_HTML_REPORTER_PAGE_TITLE="$BRANCH_NAME"\ Test\ Report
```
