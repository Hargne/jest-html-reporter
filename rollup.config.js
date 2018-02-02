/* eslint-disable import/no-extraneous-dependencies, no-console */
const resolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
const uglify = require('rollup-plugin-uglify');

const externalLibraries = ['fs', 'path', 'xmlbuilder', 'strip-ansi', 'mkdirp', 'dateformat'];

const regularBundleConfig = {
	input: 'src/index.js',
	output: {
		file: 'dist/main.js',
		format: 'cjs',
	},
	external: externalLibraries,
	plugins: [
		resolve(),
		commonjs({
			exclude: ['node_modules/**'],
		}),
	],
};

const minifiedBundleConfig = {
	input: 'src/index.js',
	output: {
		file: 'dist/main.min.js',
		format: 'cjs',
	},
	external: externalLibraries,
	plugins: [
		resolve(),
		commonjs({
			exclude: ['node_modules/**'],
		}),
		uglify(),
	],
};

export default (process.env.BUILD === 'minified') ? minifiedBundleConfig : regularBundleConfig;
