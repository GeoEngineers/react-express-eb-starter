import inquirer from "inquirer";
import chalk from "chalk";
import {
	CloudFormationClient,
	CreateStackCommand,
	DescribeStacksCommand,
} from "@aws-sdk/client-cloudformation";
import path from "path";
import fs from "fs";

import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

async function initVPC({ credentials, shortName }) {
	const { cidrBlock } = await inquirer.prompt([
		{
			type: "input",
			name: "cidrBlock",
			message: `VPC CIDR block:`,
			default: "10.22.0.0/16",
		},
	]);

	const vpcStack = await createVPCStack({ shortName, cidrBlock, credentials });
	return vpcStack;
}

async function checkStackExists({ stackName, client }) {
	const command = new DescribeStacksCommand({ StackName: stackName });

	try {
		const response = await client.send(command);
		if (response.Stacks && response.Stacks.length > 0) {
			console.log(`Stack "${stackName}" exists.`);
			return response.Stacks[0];
		} else {
			console.log(`Stack "${stackName}" does not exist.`);
			return false;
		}
	} catch (error) {
		if (
			error.name === "ValidationError" &&
			error.message.includes("Stack with id")
		) {
			console.log(`Stack "${stackName}" does not exist.`);
			return false;
		} else {
			console.error("Error checking stack existence:", error);
			throw error;
		}
	}
}

const createVPCStack = async ({ shortName, cidrBlock, credentials }) => {
	const vpcStackName = `${shortName}-vpc`;
	// Use aws-sdk client-cloudformation to create a stack
	const client = new CloudFormationClient({
		credentials,
	});

	// check if stack with stack name already exists
	const existingStack = await checkStackExists({
		stackName: vpcStackName,
		client,
	});

	if (existingStack) {
		const { useExisting } = await inquirer.prompt([
			{
				type: "confirm",
				name: "useExisting",
				message: `A VPC stack with name ${vpcStackName} already exists. Do you want to use this existing stack?`,
				default: true,
			},
		]);

		if (useExisting) {
			return existingStack;
		} else {
			process.exit();
		}
	}

	const templatePath = path.join(__dirname, "vpc-cloudformation-template.yaml");
	const templateBody = fs.readFileSync(templatePath, "utf-8");

	console.log(chalk.blue("Creating VPC using CloudFormation..."));
	const createStackCommand = new CreateStackCommand({
		StackName: vpcStackName,
		TemplateBody: templateBody,
		Parameters: [
			{
				ParameterKey: "paramVPCCidrBlockBase",
				ParameterValue: cidrBlock,
			},
		],
	});
	const data = await client.send(createStackCommand);
	console.log(chalk.blue("Stack creation in progress...", data));
	// Monitor the stack creation progress
	let stackStatus = "";
	const describeStacksCommand = new DescribeStacksCommand({
		StackName: vpcStackName,
	});
	while (stackStatus !== "CREATE_COMPLETE" && stackStatus !== "CREATE_FAILED") {
		await new Promise((resolve) => setTimeout(resolve, 10000)); // Wait 10 seconds
		const describeResponse = await client.send(describeStacksCommand);
		stackStatus = describeResponse.Stacks[0].StackStatus;
		console.log(`CloudFormation stack status: ${stackStatus}`);
	}

	if (stackStatus === "CREATE_COMPLETE") {
		console.log(
			chalk.green("CloudFormation stack creation completed successfully!")
		);
		const describeResponse = await client.send(describeStacksCommand);
		return describeResponse.Stacks[0];
	} else {
		const describeResponse = await client.send(describeStacksCommand);
		const stackEvents = describeResponse.Stacks[0].StackEvents;
		const lastEvent = stackEvents[stackEvents.length - 1];
		console.error(
			"CloudFormation stack creation failed:",
			lastEvent.ResourceStatusReason
		);
		throw new Error("CloudFormation stack creation failed");
	}
};

export default initVPC;
