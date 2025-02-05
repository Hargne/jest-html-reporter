#!/bin/sh

# Echo the current Node version
echo "Current Node version: $(node -v)"

# Convert space-separated JEST_VERSIONS to an array
for VERSION in $JEST_VERSIONS; do
    echo "Installing Jest version: $VERSION"
    npm install jest@$VERSION || exit 1

    echo "Running tests with Jest version: $VERSION"
    yarn test --config=jest.config.json || exit 1

    # Check if the output contains the expected text
    if grep -q "A Testresult Processor Title" ./testResultsProcessor.html; then
        echo "✅ Tests passed for Jest version: $VERSION"
    else
        echo "❌ Tests failed for Jest version: $VERSION"
        exit 1
    fi
done

echo "✅ All Jest versions passed!"