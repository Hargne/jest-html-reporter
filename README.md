<p align="center">
	<p align="center">📜</p>
	<h3 align="center">jest-html-reporter</h3>
	<p align="center">
		A <a href="https://github.com/facebook/jest">Jest</a> test results processor for generating a summary in HTML.
		<br>
		<a href="https://github.com/Hargne/jest-html-reporter/wiki"><strong>Documentation »</strong></a>
		<br />
		<br />
		<img src="https://img.shields.io/npm/v/jest-html-reporter?style=flat-square">
		<img src="https://img.shields.io/npm/dm/jest-html-reporter?style=flat-square">
		<img src="https://img.shields.io/github/actions/workflow/status/Hargne/jest-html-reporter/main.yml?branch=master&style=flat-square">
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

There are multiple configuration options available. To read more about these, please refer to the [documentation](https://github.com/Hargne/jest-html-reporter/wiki/configuration).

#### Alternative Usage as a Test Results Processor

To run the reporter as a test results processor (after Jest is complete instead of running in parallel), add the following entry to the Jest config (jest.config.json):

```JSON
{
	"testResultsProcessor": "./node_modules/jest-html-reporter"
}
```

**Note:** When running as a testResultsProcessor, the configuration needs be placed within a new file named `jesthtmlreporter.config.json` residing in the root folder.
More information about this can be found in the [documentation](https://github.com/Hargne/jest-html-reporter/wiki/configuration).

### Node Compatibility

<img src="https://img.shields.io/node/v/jest-html-reporter?style=flat-square">

## Configuration

All configuration properties are optional.

- `append` (boolean) - Default: `false`

  Dictates whether or not the test results should be appended to the end of an existing test report.

- `boilerplate` (string) - Default: `null`

  The path to a boilerplate file (e.g HTML) that should be used to render the body of the test results into. The variable `{jesthtmlreporter-content}` within the boilerplate will be replaced with the actual test results.

- `collapseSuitesByDefault` (boolean) - Default: `false`

  Whether to collapse test suites (accordions) by default or not.

- `customScriptPath` (string) - Default: `null`

  Path to an external script file that should be injected into the body of the test report.

- `dateFormat` (string) - Default: `yyyy-mm-dd HH:MM:ss`

  The format in which date/time should be formatted in the test report. Have a look in the [documentation](https://github.com/Hargne/jest-html-reporter/wiki/Date-Format) for the available date format variables.

- `executionTimeWarningThreshold` (number) - Default: `5`

  Test suites that pass this threshold (execution time in seconds) will be rendered with a warning on the report page. _5 seconds is the default timeout in Jest._

- `includeConsoleLog` (boolean) - Default: `false`

  If set to true, this will render all console logs for each test suite into the report. Please note that you have to run Jest together with `--verbose=false` in order to have Jest catch any logs during the tests.

- `includeFailureMsg` (boolean) - Default: `false`

  Whether or not to render detailed (verbose) error messages for failed individual tests.

- `includeStackTrace` (boolean) - Default: `true`

  Whether or not to render stack traces for failed tests.

- `includeSuiteFailure` (boolean) - Default: `false`

  Whether or not to render detailed (verbose) error messages for entire failed test suites.

- `includeObsoleteSnapshots` (boolean) - Default: `false`

  Whether or not to render obsolete snapshot names.

- `logo` (string) - Default: `null`

  Path to an image file that will be rendered in the header of the report.

- `outputPath` (string) - Default: `./test-report.html`

  The full path (including file name) to where the rendered HTML report will be output. _The path must include the filename and end with .html_

- `pageTitle` (string) - Default: `Test Report`

  The title of the document. This string will also be rendered as a heading at the top of the page.

- `sort` (string) - Default: `null`

  Sorts the test results and suites using the given method. The default setting will render suites and tests as they arrive from Jest.

  Available sort methods:

  - _`status`_ - Sorts test results based on their statuses (pending -> failed -> passed). A test suite which contains multiple test statuses is then split and will appear in multiple locations in the response.
  - _`status:{comma-separated list}`_ - Same sorting functionality as `status`, but with a custom order of statuses. Example usage: `"status:failed,passed,pending"`. By only passing in a single status, the other statuses will be sorted according to the default order.
  - _`executionasc`_ - Sorts tests by execution time (ascending).
  - _`executiondesc`_ - Sorts tests by execution time (descending).
  - _`titleasc`_ - Sorts tests by suite filename and test name (ascending).
  - _`titledesc`_ - Sorts tests by suite filename and test name (descending).

- `statusIgnoreFilter` (string) - Default: `null`

  A comma-separated string of the test result statuses that should **not** appear in the report. Available statuses are: `"passed"`, `"pending"`, `"failed"`

- `styleOverridePath` (string) - Default: `null`

  The path to a file containing CSS styles to override the default styling. The plugin will search for the given filename from the root directory and so there is no need to prepend the string with `./` or `../` - You can read more about theming in the [documentation](https://github.com/Hargne/jest-html-reporter/wiki/Test-Report-Themes).

- `useCssFile` (boolean) - Default: `false`

  Whether to inline the contents of the active CSS file or simply to link to it.

## Continuous Integration

Configuration may also be performed with environment variables for dynamic file saving paths in different environments. **\*NOTE:** Environment variables will take precedence over configurations set in jesthtmlreporter.config.json and package.json\*

#### Example

Here is an example of dynamically naming your output file and test report title to match your current branch that one might see in a automated deployment pipeline before running their tests.

```bash
export BRANCH_NAME=`git symbolic-ref HEAD 2>/dev/null | cut -d"/" -f 3`
export JEST_HTML_REPORTER_OUTPUT_PATH=/home/username/jest-test-output/test-reports/"$BRANCH_NAME".html
export JEST_HTML_REPORTER_PAGE_TITLE="$BRANCH_NAME"\ Test\ Report
```

#### Configuration Environment Variables

The environment variables reflect the configuration options available in JSON format. Please read the [documentation](https://github.com/Hargne/jest-html-reporter/wiki/configuration#configuration-environment-variables) for more information on these variables.
