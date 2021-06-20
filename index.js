#!/usr/bin/env node

/**
 *
 * Author: Saad Irfan
 * GitHub: msaaddev
 * Twitter: https://twitter.com/msaaddev
 */

// packages
const init = require('./utils/init');
const cli = require('./utils/cli');
const end = require('./utils/end');

(module.exports = async () => {
	const currentDir = __dirname;
	let flags = [];
	flags = [...process.argv.slice(2)];

	let app = '';
	if (flags.length > 1) {
		app = flags[1];
	}
	
	const name = await init(flags);

	try {
		await cli(name, currentDir, app);
	} catch (err) {}
	end();
})();
