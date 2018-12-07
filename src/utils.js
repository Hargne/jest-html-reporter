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
 * Sets up a basic HTML page to apply the content to
 * @return {xmlbuilder}
 */
const createHtmlBase = ({ pageTitle, stylesheet }) => xmlbuilder.create({
	html: {
		head: {
			meta: { '@charset': 'utf-8' },
			title: { '#text': pageTitle },
			link: { '@rel': 'stylesheet' , '@type': 'text/css', '@href': 'test-report-style.css'}
			//style: { '@type': 'text/css', '#text': stylesheet },
		},
	},
});

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
	createHtmlBase,
	sortAlphabetically,
};
