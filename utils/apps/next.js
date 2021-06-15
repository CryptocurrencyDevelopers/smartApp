const { command } = require('execa');
const exec = require('node-async-exec');
const writeJsonFile = require('write-json-file');
const ora = require('ora');
const chalk = require('chalk');
const isItGit = require('is-it-git');
const { getPath, nextTailwind } = require('../../functions/path');
const scripts = require('../../template/nextjs/scripts.json');
const handleError = require('../../functions/handleError');

module.exports = async (name, currentDir) => {
	// get nextjs project path
	const { path, isWindows } = getPath(name);
	const tailwindPaths = nextTailwind(name, currentDir);

	// spinner
	const spinner = ora();

	try {
		spinner.start(`${chalk.bold.dim('Creating a Next.js App...')}`);

		await command(`npx create-next-app ${name}`);

		spinner.succeed(`${chalk.green('Next.js App created.')}`);

		// check if directory exists
		const isGitDir = isItGit(path);

		// deleting .git directory
		if (isGitDir) {
			if (!isWindows) {
				await command(`rm -rf ${tailwindPaths.gitDir}`);
			} else {
				await command(`rmdir /Q /S ${tailwindPaths.winGitDir}`);
			}
		}

		spinner.start(`${chalk.bold.dim('Adding tailwind configurations...')}`);

		if (!isWindows) {
			// copying tailwind config files
			command(`cp ${tailwindPaths.postCSSConfig} ${path}`);
			command(`cp ${tailwindPaths.tailwindConfig} ${path}`);

			// removing existing files
			await command(`rm -rf ${tailwindPaths.appjsPath}`);
			await command(`rm -rf ${tailwindPaths.globalCSS}`);

			command(`cp ${tailwindPaths.writeAppJS} ${tailwindPaths.pagesDir}`);
			command(
				`cp ${tailwindPaths.writeGlobalCSS} ${tailwindPaths.stylesDir}`
			);

			command(`cp ${tailwindPaths.prettier} ${path}`);

			// writing content to package.json for tailwind
			const pkgJSON = require(`${tailwindPaths.pkgJSON}`);
			const tlwPkgJSON = { ...pkgJSON, ...scripts };
			await writeJsonFile(`${tailwindPaths.pkgJSON}`, tlwPkgJSON);
		} else {
			// copying tailwind config files
			command(`copy ${tailwindPaths.winPostCSSConfig} ${path}`);
			command(`copy ${tailwindPaths.winTailwindConfig} ${path}`);

			// removing existing files
			await command(`del ${tailwindPaths.winAppjsPath}`);
			await command(`del ${tailwindPaths.winGlobalCSS}`);

			// copying _app.js, global css and prettier
			command(
				`copy ${tailwindPaths.winWriteAppJS} ${tailwindPaths.winPagesDir}`
			);
			command(
				`copy ${tailwindPaths.winWriteGlobalCSS} ${tailwindPaths.winStylesDir}`
			);
			command(`copy ${tailwindPaths.winPrettier} ${path}`);

			// writing content to package.json for tailwind
			const pkgJSON = require(`${tailwindPaths.winPkgJSON}`);
			const tlwPkgJSON = { ...pkgJSON, ...scripts };
			await writeJsonFile(`${tailwindPaths.winPkgJSON}`, tlwPkgJSON);
		}

		// installing dependencies
		await exec({
			path,
			cmd: `npm install -D tailwindcss@latest postcss@latest autoprefixer@latest prettier`
		});
		await exec({ path, cmd: `npm run format` });

		// succeed
		spinner.succeed(`${chalk.green('Tailwind configurations added.')}`);
	} catch (err) {
		spinner.fail(`Couldn't create Next.js Tailwind app.`);
		handleError(name, err);
	}
};