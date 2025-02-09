#!/bin/sh

JEST_VERSIONS=${JEST_VERSIONS:-"29"}  # Default Jest versions

# Echo the current Node version
echo "Current Node version: $(node -v)"´

# Create a jest config with properties we should test against
FILENAME="test-report"
PAGE_TITLE="A Title For This Report"

cat <<EOF > jest.config.json || { echo "❌ Failed to create jest.config.json"; exit 1; }
{
  "testEnvironment": "node",
  "reporters": [
    "default",
    ["<rootDir>/jest-html-reporter", {
      "outputPath": "<rootDir>/${FILENAME}.html",
      "pageTitle": "${PAGE_TITLE}",
    }]
  ]
}
EOF

for VERSION in $JEST_VERSIONS; do
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