// get name from package.json
import chalk from "chalk";
import pkg from "../package.json" assert { type: "json" };
import inquirer from "inquirer";
import fs from "fs";
import path from "path";
import getCredentials from "./getCredentials.js";
import createVPC from "./createVPC.js";
import {
	createEBApplication,
	createEBEnvironment,
} from "./createEBApplication.js";

const shortName = pkg.name;

async function initDeployment() {
	try {
		console.log(
			chalk.blue(
				"This script will create a new Elastic Beanstalk application and environment. The commands will be run using your default AWS profile unless otherwise specified."
			)
		);

		// us fs to check .env.local for AWS_PROFILE and return it if found
		const existingAwsProfile = fs
			.readFileSync(path.join(process.cwd(), ".env.local"), "utf-8")
			.match(/AWS_PROFILE=(\w+)/)?.[1];

		const { profile } = await inquirer.prompt([
			{
				type: "input",
				name: "profile",
				message: "AWS Profile:",
				default: existingAwsProfile ?? "default",
			},
		]);

		const { region } = await inquirer.prompt([
			{
				type: "input",
				name: "region",
				message: "AWS Region:",
				default: "us-west-2",
			},
		]);

		// if profile is provided and not 'default', add it to AWS_PROFILE in .env.local
		// if AWS_PROFILE already exists, replace value

		if (profile !== "default") {
			const existingAwsProfile = fs
				.readFileSync(path.join(process.cwd(), ".env.local"), "utf-8")
				.match(/AWS_PROFILE=(\w+)/)?.[1];
			if (existingAwsProfile) {
				fs.writeFileSync(
					path.join(process.cwd(), ".env.local"),
					fs
						.readFileSync(path.join(process.cwd(), ".env.local"), "utf-8")
						.replace(new RegExp(`AWS_PROFILE=\\w+`), `AWS_PROFILE=${profile}`)
				);
			} else {
				fs.appendFileSync(
					path.join(process.cwd(), ".env.local"),
					`
					AWS_PROFILE=${profile}
					`
				);
			}
		}

		// const credentials = await getCredentials({ profile, region });

		// const vpcStack = await createVPC({ credentials, shortName });

		// console.log(chalk.green(vpcStack));

		// console.log(chalk.green("Creating Elastic Beanstalk application..."));
		console.log(shortName);
		// const ebApplication = await createEBApplication({
		// 	credentials,
		// 	shortName,
		// });

		// console.log(chalk.green("Creating Elastic Beanstalk environment..."));
		// const ebEnvironment = await createEBEnvironment({
		// 	credentials,
		// 	ebApplication,
		// 	vpcStack,
		// });
		// console.log(chalk.green(ebEnvironment));

		const { createActions } = await inquirer.prompt([
			{
				type: "confirm",
				name: "createActions",
				message: "Set up continuous deployment using Github Actions?",
				default: true,
			},
		]);

		if (createActions) {
			// load deploy-to-eb-template.yml, replace $SHORTNAME with shortName
			const templatePath = path.join(
				process.cwd(),
				"init-scripts/deploy-to-eb-template.yml"
			);
			const templateBody = fs.readFileSync(templatePath, "utf-8");
			const replacedTemplateBody = templateBody.replace(
				/\$SHORTNAME/g,
				shortName
			);
			fs.writeFileSync(
				path.join(process.cwd(), ".github/workflows/deploy-to-eb-template.yml"),
				replacedTemplateBody
			);
		}
	} catch (error) {
		console.error(chalk.red(error));
	}
}

initDeployment();
