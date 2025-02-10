ARG NODE_VERSION=14
ARG JEST_VERSIONS=19

FROM node:20.10.0 AS build

# Pass arguments as environment variables so they persists when we switch Node version
ENV JEST_VERSIONS=$JEST_VERSIONS

# Build the Jest HTML Reporter package
WORKDIR /app
COPY . .
RUN yarn install
RUN yarn bundle

# Switch to a different Node version
FROM node:${NODE_VERSION}-slim AS final

# Re-declare environment variables as we have switched node
ARG JEST_VERSIONS
ENV JEST_VERSIONS=$JEST_VERSIONS

WORKDIR /app

# Copy over the Jest HTML Reporter package we built in the previous step
COPY --from=build /app/dist /app/jest-html-reporter/dist
COPY --from=build /app/style /app/jest-html-reporter/style
COPY --from=build /app/package.json /app/jest-html-reporter/package.json
COPY --from=build /app/yarn.lock /app/jest-html-reporter/yarn.lock

# Install jest-html-reporter dependencies using yarn
WORKDIR /app/jest-html-reporter
ENV NODE_ENV=production
RUN npm install --ignore-engines

# Copy and run the test-project directory into the container and run the tests with the Jest HTML Reporter
WORKDIR /app
COPY /e2e/test-project /app
RUN npm install

# Run the bash script containing the tests
COPY /e2e/run_tests.sh /app/run_tests.sh
RUN chmod +x /app/run_tests.sh

CMD ["/bin/sh", "/app/run_tests.sh"]