const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const xmlbuilder = require('xmlbuilder');

/**
 * Logs a message of a given type in the terminal
 * @param {String} type
 * @param {String} msg
 * @return {Object}
 */
const logMessage = ({ type, msg, ignoreConsole }) => {
	const logTypes = {
		default: '\x1b[37m%s\x1b[0m',
		success: '\x1b[32m%s\x1b[0m',
		error: '\x1b[31m%s\x1b[0m',
	};
	const logColor = (!logTypes[type]) ? logTypes.default : logTypes[type];
	const logMsg = `jest-html-reporter >> ${msg}`;
	if (!ignoreConsole) {
		console.log(logColor, logMsg); // eslint-disable-line
	}
	return { logColor, logMsg }; // Return for testing purposes
};

/**
 * Creates a file at the given destination
 * @param  {String} filePath
 * @param  {Any} 	content
 */
const writeFile = ({ filePath, content }) => new Promise((resolve, reject) => {
	mkdirp(path.dirname(filePath), (mkdirpError) => {
		if (mkdirpError) {
			return reject(new Error(`Something went wrong when creating the folder: ${mkdirpError}`));
		}
		return fs.writeFile(filePath, content, (writeFileError) => {
			if (writeFileError) {
				return reject(new Error(`Something went wrong when creating the file: ${writeFileError}`));
			}
			return resolve(filePath);
		});
	});
});

/**
 * Appends a file at the given destination
 * @param  {String} filePath
 * @param  {Any} 	content
 */
const appendFile = ({ filePath, content }) => new Promise((resolve, reject) => {
	mkdirp(path.dirname(filePath), (mkdirpError) => {
		if (mkdirpError) {
			return reject(new Error(`Something went wrong when creating the folder: ${mkdirpError}`));
		}

		// Check if the file exists or not
		return fs.readFile(filePath, 'utf8', (err, existingContent) => {
			let parsedContent = content;
			// The file exists - we need to strip all unecessary html
			if (!err) {
				const contentSearch = /<body>(.*?)<\/body>/gm.exec(content);
				if (contentSearch) {
					const [strippedContent] = contentSearch;
					parsedContent = strippedContent;
				}
				// Then we need to add the stripped content just before the </body> tag
				if (existingContent) {
					let newContent = existingContent;
					const closingBodyTag = /<\/body>/gm.exec(existingContent);
					const indexOfClosingBodyTag = closingBodyTag ? closingBodyTag.index : 0;

					newContent = [existingContent.slice(0, indexOfClosingBodyTag), parsedContent, existingContent.slice(indexOfClosingBodyTag)]
						.join('');

					return fs.writeFile(filePath, newContent, (writeFileError) => {
						if (writeFileError) {
							return reject(new Error(`Something went wrong when creating the file: ${writeFileError}`));
						}
						return resolve(filePath);
					});
				}
			}

			return fs.appendFile(filePath, parsedContent, (writeFileError) => {
				if (writeFileError) {
					return reject(new Error(`Something went wrong when appending the file: ${writeFileError}`));
				}
				return resolve(filePath);
			});
		});
	});
});

/**
 * Reads and returns the content of a given file
 * @param  {String} filePath
 */
const getFileContent = ({ filePath }) => new Promise((resolve, reject) => {
	fs.readFile(filePath, 'utf8', (err, content) => {
		if (err) {
			return reject(new Error(`Could not locate file: '${filePath}': ${err}`));
		}
		return resolve(content);
	});
});

/**
 * Sets up a basic HTML page to apply the content to
 * @return {xmlbuilder}
 */
const createHtmlBase = ({ pageTitle, stylesheet, stylesheetPath }) => {
	const htmlBase = {
		html: {
			head: {
				meta: { '@charset': 'utf-8' },
				title: { '#text': pageTitle },
			},
		},
	};

	if (stylesheetPath) {
		htmlBase.html.head.link = { '@rel': 'stylesheet', '@type': 'text/css', '@href': stylesheetPath };
	} else {
		htmlBase.html.head.style = { '@type': 'text/css', '#text': stylesheet };
	}

	return xmlbuilder.create(htmlBase);
};

const sortAlphabetically = ({ a, b, reversed }) => {
	if ((!reversed && a < b) || (reversed && a > b)) {
		return -1;
	} else if ((!reversed && a > b) || (reversed && a < b)) {
		return 1;
	}
	return 0;
};

module.exports = {
	logMessage,
	writeFile,
	appendFile,
	getFileContent,
	createHtmlBase,
	sortAlphabetically,
};
