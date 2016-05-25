'use strict';

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
const appRoot = process.cwd();
const sourceDirectory = `${appRoot}/src/`;

class GenerateTemplates {
	constructor() {
		this.loadSizes();
		this.setupSource();

		this.formatFiles = ['dynamic.js', 'main.js', 'static.js', 'overwrite.scss'];
	}

	loadSizes() {
		const sizesFile = fs.readFileSync(`${appRoot}/sizes.json`, `utf8`);
		let sizes = JSON.parse(sizesFile);
		this.sizes = sizes.dimensions;
	}

	processSizes() {
		this.sizes.map((size) => {
			this.checkTemplate(`${sourceDirectory}${size.prefix}${size.width}x${size.height}`, size);
		});
	}

	setupSource() {
		let that = this;
		fs.access(sourceDirectory, fs.F_OK, function(err) {
			if (!err) {
				console.info(chalk.blue(`Source directory already exists`));
				that.processSizes();
			} else {
				that.createSource();
			}
		});
	}

	createSource() {
		let that = this;
		fs.mkdir(sourceDirectory, (err, folder) => {
			if (err) {
				console.log(err);
				console.error(chalk.red(`src could not be created`));
			} else {
				console.info(chalk.blue(`src has been created`));
				that.populateSrc();
			}
		});
	}

	populateSrc() {
		let globalSass = `${appRoot}/base-template/global.scss`;
		let normalizeSass = `${appRoot}/base-template/normalize.scss`;
		fs.createReadStream(globalSass).pipe(fs.createWriteStream(`${sourceDirectory}global.scss`));
		fs.createReadStream(normalizeSass).pipe(fs.createWriteStream(`${sourceDirectory}normalize.scss`));
		this.processSizes();
	}

	checkTemplate(dir, data) {
		let that = this;
		fs.access(dir, fs.F_OK, function(err) {
			if (!err) {
				console.info(chalk.blue(`${dir} Already exists`));
			} else {
				console.info(chalk.blue(`Creating ${dir}`));
				that.generateTemplate(dir, data);
			}
		});
	}

	generateTemplate(dir, data) {
		let that = this;
		fs.mkdir(dir, (err, folder) => {
			if (err) {
				console.log(err);
				console.error(chalk.red(`${dir} Could not be created`));
			} else {
				console.info(chalk.blue(`${dir} has been created`));
				that.populateTemplate(dir, data);
			}
		});
	}

	populateTemplate(dir, data) {
		fs.createReadStream(`${appRoot}/base-template/index.html`).pipe(fs.createWriteStream(`${dir}/index.html`));
		fs.createReadStream(`${appRoot}/base-template/data.json`).pipe(fs.createWriteStream(`${dir}/data.json`));

		this.formatFiles.map((file) => {
			this.formatPopulate(file, data, dir);
		});

	}

	format(str, obj) {
		return str.toString().replace(/\{{([^}]+)\}}/g, function(match, group) {
			return obj[group];
		});
	}

	formatPopulate(file, data, dir) {
		let fileData = fs.readFileSync(`${appRoot}/base-template/${file}`, 'utf8');
    console.log(data);
		let processedData = this.format(fileData, data);
		fs.writeFileSync(`${dir}/${file}`, processedData, 'utf8');
	}

}

new GenerateTemplates();
