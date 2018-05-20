#!/usr/bin/env node

const	fs = require('fs'),
		path = require('path');

const getCSSFiles = function(cb)
{
	let projectRoot = process.cwd(),
		validFTs = ['css', 'less', 'sass', 'scss', 'styl'],
		ignoreDirs = [
			'.git',
			'bin',
			'bower_components',
			'node_modules',
			'vendor'
		],
		results = [];

		fs.readdir(projectRoot, function(err, list)
		{
			if (err)
			{
				return cb(err);
			}

			let pending = list.length;

			if (!pending) return cb(null, results);

			function enterDir(dir)
			{
				let dirname = path.basename(dir);
				if (ignoreDirs.indexOf(dirname) !== -1) return;

				fs.readdir(dir, function(err, list)
				{
					if (err)
					{
						return cb(err);
					}

					let pending = list.length;

					if (!pending)
					{
						return cb(null, results);
					}

					list.forEach(function(file)
					{
						file = path.resolve(dir, file);
						let stat = fs.lstatSync(file),
							pending = list.length;
						if (!stat.isFile())
						{
							pending--;
							enterDir(file);
							return;
						}

						let fileExtension = String(path.extname(file)).split('.')[1];
						pending--;

						if (validFTs.indexOf(fileExtension) === -1) return;

						results.push(file);

						if (pending === 0)
						{
							return cb(null, results);
						}

					});

				});
			}

			list.forEach(function(file)
			{
				file = path.resolve(projectRoot, file);
				let stat = fs.lstatSync(file),
					pending = list.length;

				if (!stat.isFile())
				{
					pending--;
					enterDir(file);
					return;
				}

				let fileExtension = String(path.extname(file)).split('.')[1];
				pending--;
				if (validFTs.indexOf(fileExtension) === -1) return;

				results.push(file);

				if (pending === 0)
				{
					return cb(null, results);
				}

			});
		});
};

getCSSFiles(function(err, files)
{
	if (err) throw err;
	if (!files.length)
	{
		console.log('No CSS, LESS, SASS, SCSS or Styl files were found');
		process.exit(0);
	}
	files.forEach(function(file)
	{
		fs.readFile(file, 'utf8', function (err, data)
		{
			if (err) throw err;
			
			let pattern = /([.|%|-]([\S]+))/g,
				matches = data.match(pattern);

			if (!matches) return;

			matches.forEach(function(match)
			{
				let selector = match.substr(1),
					selectorName = match.charAt(0) + selector;

				function isValidStartingChar(char)
				{
					return char.match(/[-|_|A-Z|a-z]/i);
				}

				switch (true)
				{
					case Number.isInteger(parseInt(selector.charAt(0))):
						console.log(`${selectorName} cannot start with a number!`);
					break;

					case selector.length < 2:
						console.log(`${selectorName} must be at least 2 characters long`);
					break;
					
					case !isValidStartingChar(selector.charAt(0)):
						console.log(`${selectorName} must start with either a letter, hyphen or underscore`);
					break;

					case selector.charAt(0) == '_' && (!selector.charAt(1).match(/(A-Z|a-z)/) || !selector.charAt(1) == '_'):
						console.log(`If ${selectorName} starts with a hyphen, the second character must either be an underscore or letter`);
					break;
				}
			});

		});
	});
});
