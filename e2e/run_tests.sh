#!/bin/sh

JEST_VERSIONS=${JEST_VERSIONS:-"29"}  # Default Jest versions

# Echo the current Node version
echo "Current Node version: $(node -v)"

# Create a jest config with properties we should test against
FILENAME="test-report"
PAGE_TITLE="A Title For This Report"

for VERSION in $JEST_VERSIONS; do
  # Extract the major version number
  MAJOR_VERSION=$(echo "$VERSION" | cut -d. -f1)

  # For Jest versions above 20 we use the reporters option
  if [ "$MAJOR_VERSION" -ge 20 ]; then
    cat <<EOF > jest.config.json || { echo "❌ Failed to create jest.config.json"; exit 1; }
{
  "testEnvironment": "node",
  "reporters": [
    "default",
    ["<rootDir>/jest-html-reporter", {
      "append": false,
      "boilerplate": null,
      "collapseSuitesByDefault": true,
      "customScriptPath": null,
      "dateFormat": "yyyy-mm-dd (HH:MM:ss)",
      "executionTimeWarningThreshold": 1,
      "includeConsoleLog": true,
      "includeFailureMsg": true,
      "includeStackTrace": true,
      "includeSuiteFailure": true,
      "logo": "https://placehold.co/100x50/png?text=Test+Report&font=playfair-display",
      "outputPath": "<rootDir>/${FILENAME}.html",
      "pageTitle": "${PAGE_TITLE}",
      "sort": "status",
      "statusIgnoreFilter": null,
      "styleOverridePath": "./style/defaultTheme.css",
      "useCssFile": true
    }]
  ]
}
EOF
  else
    cat <<EOF > jest.config.json || { echo "❌ Failed to create jest.config.json"; exit 1; }
{
  "testEnvironment": "node",
  "testResultsProcessor": "<rootDir>/jest-html-reporter"
}
EOF
    cat <<EOF > jesthtmlreporter.config.json || { echo "❌ Failed to create jesthtmlreporter.config.json"; exit 1; }
{
  "append": false,
  "boilerplate": null,
  "collapseSuitesByDefault": true,
  "customScriptPath": null,
  "dateFormat": "yyyy-mm-dd (HH:MM:ss)",
  "executionTimeWarningThreshold": 1,
  "includeConsoleLog": true,
  "includeFailureMsg": true,
  "includeStackTrace": true,
  "includeSuiteFailure": true,
  "logo": "https://placehold.co/100x50/png?text=Test+Report&font=playfair-display",
  "outputPath": "<rootDir>/${FILENAME}.html",
  "pageTitle": "${PAGE_TITLE}",
  "sort": "status",
  "statusIgnoreFilter": null,
  "styleOverridePath": "./style/defaultTheme.css",
  "useCssFile": true
}
EOF
  fi

  echo "Installing Jest version: $VERSION"
  npm install jest@$VERSION || exit 1

  echo "Running tests with Jest version: $VERSION"
  npm run test -- --config=jest.config.json || exit 1

  # Check if the output contains the expected text
  if grep -q "$PAGE_TITLE" ./$FILENAME.html; then
      echo "✅ Tests passed for Jest version: $VERSION"
  else
      echo "❌ Tests failed for Jest version: $VERSION"
      exit 1
  fi
done

echo "✅ All Jest versions passed!"