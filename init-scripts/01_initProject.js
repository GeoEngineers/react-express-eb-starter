import fs from "fs";
import path from "path";
import { exec } from "child_process";
import inquirer from "inquirer";
import chalk from "chalk";
import pg from "pg";
const { Client } = pg;

async function initProject() {
	console.log(
		chalk.blue(
			"This script will ask a few questions and quickly scaffold out a development environment."
		)
	);

	const { appName } = await inquirer.prompt([
		{
			type: "input",
			name: "appName",
			message: "Name this app:",
		},
	]);

	const shortName = appName.toLowerCase().replace(/[^a-zA-Z0-9]/g, "-");

	console.log(
		chalk.blue(`This app will be named ${appName} (short name: ${shortName})`)
	);

	console.log(chalk.blue("Adding parameters to .env.local file..."));

	fs.appendFileSync(
		path.join(process.cwd(), ".env.local"),
		`
NODE_ENV=development
VITE_APP_TITLE='${appName}'
VITE_APP_SHORT_NAME='${shortName}'
`
	);

	console.log(chalk.blue("Renaming package..."));

	const packageJson = JSON.parse(
		fs.readFileSync(path.join(process.cwd(), "package.json"), "utf8")
	);
	packageJson.name = shortName;
	fs.writeFileSync(
		path.join(process.cwd(), "package.json"),
		JSON.stringify(packageJson, null, 2)
	);

	const { needsDatabase } = await inquirer.prompt([
		{
			type: "confirm",
			name: "needsDatabase",
			message: "Will this app require a database?",
		},
	]);

	if (needsDatabase) {
		console.log(
			chalk.blue(
				"Attempting to create a database. This script expects Postgres to be installed as well as psql."
			)
		);

		const { databaseName } = await inquirer.prompt([
			{
				type: "input",
				name: "databaseName",
				message: `Please enter a database name (leave blank to use '${shortName}'):`,
				default: shortName,
			},
		]);

		const client = new Client({
			user: "postgres",
			host: "localhost",
			database: "postgres",
			port: 5432,
		});

		await client.connect();

		try {
			await client.query(`CREATE DATABASE "${databaseName}"`);
			console.log(chalk.green(`Database ${databaseName} created.`));
		} catch (err) {
			if (err.code === "42P04") {
				console.log(chalk.yellow(`Database ${databaseName} already exists.`));
			} else {
				console.error(chalk.red(`Error creating database: ${err.message}`));
			}
		} finally {
			await client.end();
		}

		fs.appendFileSync(
			path.join(process.cwd(), ".env.local"),
			`
DB_NAME='${databaseName}'
`
		);
	} else {
		console.log(chalk.blue("Skipping database."));
	}

	console.log(
		chalk.green(`
Done. To start the app in development mode, run 'npm run dev'.
To build the app for production, run 'npm run build'.
To start the app in production mode, run 'npm run start'.
To create an Elastic Beanstalk deployment, run 'npm run init-eb-deployment'
`)
	);
}

function which(cmd) {
	try {
		return (
			fs.existsSync(`/usr/bin/${cmd}`) || fs.existsSync(`/usr/local/bin/${cmd}`)
		);
	} catch (err) {
		return false;
	}
}

initProject();
