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
	<img src="https://user-images.githubusercontent.com/3501024/35678183-b038d6ca-0752-11e8-85ca-9be570e80872.png" alt="">
	<br />
	<br />
	This plugin was inspired by <a href="https://github.com/matthias-schuetz/karma-htmlfile-reporter">karma-htmlfile-reporter</a>
  </p>
</p>

***

## Installation
```shell
npm install jest-html-reporter --save-dev
```

## Usage
Configure Jest to process the test results by adding the following entry to the Jest config (jest.config.js):
```
{
	"testResultsProcessor": "./node_modules/jest-html-reporter"
}
```
Then when you run Jest from within the terminal, a file called *test-report.html* will be created within your root folder containing information about your tests.

### Alternative usage with package.json
Although jest.config.js is specifically created for configuring Jest (and not this plugin), it is possible to configure Jest from within package.json by adding the following as a new line:
```JSON
"jest": {"testResultsProcessor": "./node_modules/jest-html-reporter" }
```

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

#### *A note on styleOverridePath
The plugin will search for the file from the root directory, therefore there is no need to prepend the string with ./ or ../

Have a look at the default styling (located within the root of this repository named *style.css*) for a reference of the elements available for styling.

### Example Configuration

```
{
	"pageTitle": "Your test suite",
	"outputPath": "test-report/index.html",
	"includeFailureMsg": false,
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
		"outputPath": "test-report/index.html",
		"includeFailureMsg": false,
		"styleOverridePath": "src/teststyle.css"
	}
}
```

---

## Continuous Integration

Configuration may also be performed with environment variables for dynamic file saving paths in different environments. 

***NOTE:** jesthtmlreporter.config.json and package.json will take precedence over environment variables.*

### Example
Here is an example of dynamically naming your output file and test report title to match your current branch that one might see in a automated deployment pipeline before running their tests.

```bash
export BRANCH_NAME=`git symbolic-ref HEAD 2>/dev/null | cut -d"/" -f 3`
export JEST_HTML_REPORTER_OUTPUT_PATH=/home/username/jest-test-output/test-reports/"$BRANCH_NAME".html
export JEST_HTML_REPORTER_PAGE_TITLE="$BRANCH_NAME"\ Test\ Report
```

### Configuration Environment Variables
| Variable Name | Type | Description | Default
|--|--|--|--|
| `JEST_HTML_REPORTER_PAGE_TITLE` | `STRING` | The title of the document. This string will also be outputted on the top of the page. | `"Test Suite"`
| `JEST_HTML_REPORTER_OUTPUT_PATH` | `STRING` | The path to where the plugin will output the HTML report. The path must include the filename and end with .html | `"./test-report.html"`
| `JEST_HTML_REPORTER_INCLUDE_FAILURE_MSG` | `BOOLEAN` | If this setting is set to true, this will output the detailed failure message for each failed test. | `false`
| `JEST_HTML_REPORTER_STYLE_OVERRIDE_PATH` | `STRING` | The path to a file containing CSS styles that should override the default styling. | `null`

