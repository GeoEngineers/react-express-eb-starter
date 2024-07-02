import inquirer from "inquirer";
import chalk from "chalk";
import {
	CreateApplicationCommand,
	CreateEnvironmentCommand,
	ElasticBeanstalkClient,
	ListPlatformBranchesCommand,
	DescribeApplicationsCommand,
	ListAvailableSolutionStacksCommand,
} from "@aws-sdk/client-elastic-beanstalk";
import { DescribeSecurityGroupsCommand, EC2Client } from "@aws-sdk/client-ec2";
import fs from "fs";
import path from "path";

export async function createEBApplication({
	credentials,
	shortName,
	// vpcStack,
}) {
	const client = new ElasticBeanstalkClient({ credentials });
	// check .env.local for EB_APP_NAME
	const envFile = fs.readFileSync(
		path.join(process.cwd(), ".env.local"),
		"utf8"
	);

	const existingEbAppName = envFile
		.split("\n")
		.find((line) => line.startsWith("EB_APP_NAME="))
		?.split("=")[1];

	const { ebAppName } = await inquirer.prompt([
		{
			type: "input",
			name: "ebAppName",
			message: `Name of Elastic Beanstalk application:`,
			default: existingEbAppName || shortName,
		},
	]);

	// check elastic beanstalk for application with ebAppName
	const existingApp = await client.send(
		new DescribeApplicationsCommand({
			ApplicationNames: [ebAppName],
		})
	);

	let appReturn;

	if (existingApp.Applications.length > 0) {
		console.log(
			chalk.yellow(`An application with the name ${ebAppName} already exists.`)
		);
		const { useExistingApplication } = await inquirer.prompt([
			{
				type: "confirm",
				name: "useExistingApplication",
				message: `Do you want to use the existing application?`,
				default: true,
			},
		]);
		if (useExistingApplication) {
			console.log(
				chalk.green(
					`Using existing application ${existingApp.Applications[0].ApplicationName}.`
				)
			);
			appReturn = existingApp.Applications[0];
		} else {
			appReturn = await createApp({ ebAppName, shortName, client });
		}
	} else {
		appReturn = await createApp({ ebAppName, shortName, client });
	}
	return appReturn;
}

async function createApp({ ebAppName, shortName, client }) {
	console.log(chalk.yellow(`Creating application ${ebAppName}.`));
	const { description } = await inquirer.prompt([
		{
			type: "input",
			name: "description",
			message: `Description of Elastic Beanstalk application:`,
			default: "",
		},
	]);

	const input = {
		// CreateApplicationMessage
		ApplicationName: ebAppName, // required
		Description: description,
		// ResourceLifecycleConfig: {
		// 	// ApplicationResourceLifecycleConfig
		// 	ServiceRole:
		// 		"arn:aws:iam::065082189539:role/aws-elasticbeanstalk-service-role",
		// 	VersionLifecycleConfig: {
		// 		// ApplicationVersionLifecycleConfig
		// 		MaxCountRule: {
		// 			// MaxCountRule
		// 			Enabled: true || false, // required
		// 			MaxCount: Number(20),
		// 			DeleteSourceFromS3: true || false,
		// 		},
		// 		MaxAgeRule: {
		// 			// MaxAgeRule
		// 			Enabled: true || false, // required
		// 			MaxAgeInDays: Number(200),
		// 			DeleteSourceFromS3: true || false,
		// 		},
		// 	},
		// },
		Tags: [
			// Tags
			{
				Key: "PRODUCT",
				Value: shortName,
			},
		],
	};
	// console.log(input);
	const command = new CreateApplicationCommand(input);
	const response = await client.send(command);
	// append EB_APP_NAME to .env.local
	fs.appendFileSync(
		path.join(process.cwd(), ".env.local"),
		`
EB_APP_NAME=${ebAppName}
`
	);
	console.log(chalk.green(`Successfully created application ${ebAppName}.`));
	return response.Application;
}

export async function createEBEnvironment({
	ebApplication,
	vpcStack,
	credentials,
	env = "prod",
}) {
	const client = new ElasticBeanstalkClient({ credentials });
	console.log("ebAPplication", ebApplication);
	const { envName } = await inquirer.prompt([
		{
			type: "input",
			name: "envName",
			message: `Name of Elastic Beanstalk environment:`,
			default: `${ebApplication.ApplicationName}-${env}`,
		},
	]);

	const { instanceType } = await inquirer.prompt([
		{
			type: "list",
			name: "instanceType",
			message: `Select an instance type:`,
			choices: [
				"t3.nano",
				"t3.micro",
				"t3.small",
				"t3.medium",
				"t3.large",
				"t3.xlarge",
				"t3.2xlarge",
			],
			default: "t3.small",
		},
	]);

	const { createDb } = await inquirer.prompt([
		{
			type: "confirm",
			name: "createDb",
			message: `Create RDS database?`,
			default: true,
		},
	]);

	const listInput = {};
	const listCommand = new ListAvailableSolutionStacksCommand(listInput);
	const listResponse = await client.send(listCommand);

	const stackChoices = listResponse.SolutionStacks.filter((stack) => {
		// return true if string contains "node"
		return stack.includes("64bit Amazon Linux 2023");
	});
	const { selectedStack } = await inquirer.prompt([
		{
			type: "list",
			name: "selectedStack",
			message: `Select a solution stack:`,
			choices: stackChoices,
		},
	]);

	const vpcOutputs = vpcStack.Outputs.reduce((acc, output) => {
		acc[output.OutputKey] = output.OutputValue;
		return acc;
	}, {});
	// get VITE_APP_TITLE from .env.local
	const viteAppTitle = fs
		.readFileSync(path.join(process.cwd(), ".env.local"), "utf8")
		.split("\n")
		.find((line) => line.startsWith("VITE_APP_TITLE="))
		.split("=")[1];
	const ec2Client = new EC2Client({ credentials });

	const describeSecurityGroupsCommand = new DescribeSecurityGroupsCommand({
		Filters: [
			{
				Name: "vpc-id",
				Values: [vpcOutputs.PubPrivateVPCID],
			},
			{
				Name: "group-name",
				Values: ["default"],
			},
		],
	});

	let defaultSecurityGroup;
	const securityGroupResponse = await ec2Client.send(
		describeSecurityGroupsCommand
	);
	if (securityGroupResponse.SecurityGroups.length > 0) {
		defaultSecurityGroup = securityGroupResponse.SecurityGroups[0].GroupId;
	} else {
		throw new Error(`No default security group found for VPC ${vpcId}`);
	}

	console.log(chalk.yellow(`Creating environment ${envName}.`));

	const applicationName = ebApplication.ApplicationName;
	const input = {
		ApplicationName: applicationName,
		EnvironmentName: envName,
		SolutionStackName: selectedStack,
		Tier: {
			// EnvironmentTier
			Name: "WebServer",
			Type: "Standard",
		},
		OptionSettings: [
			{
				// ConfigurationOptionSetting
				Namespace: "aws:elasticbeanstalk:cloudwatch:logs",
				OptionName: "StreamLogs",
				Value: true,
			},
			{
				// ConfigurationOptionSetting
				Namespace: "aws:elasticbeanstalk:cloudwatch:logs",
				OptionName: "DeleteOnTerminate",
				Value: true,
			},
			{
				Namespace: "aws:elasticbeanstalk:environment",
				OptionName: "EnvironmentType",
				Value: "LoadBalanced",
			},
			{
				Namespace: "aws:autoscaling:asg",
				OptionName: "MinSize",
				Value: 1,
			},
			{
				Namespace: "aws:autoscaling:asg",
				OptionName: "MaxSize",
				Value: 1,
			},
			{
				Namespace: "aws:ec2:vpc",
				OptionName: "VPCId",
				Value: vpcOutputs.PubPrivateVPCID,
			},
			// {
			// 	Namespace: "aws:ec2:vpc",
			// 	OptionName: "SecurityGroup",
			// 	Value: defaultSecurityGroup,
			// },
			// {
			// 	Namespace: "aws:ec2:vpc",
			// 	OptionName: "ELBPublic",
			// 	Value: true,
			// },
			{
				Namespace: "aws:ec2:vpc",
				OptionName: "ELBSubnets",
				Value: `${vpcOutputs.PublicSubnet1ID},${vpcOutputs.PublicSubnet2ID}`,
			},
			{
				Namespace: "aws:ec2:vpc",
				OptionName: "Subnets",
				Value: `${vpcOutputs.PrivateSubnet1ID},${vpcOutputs.PrivateSubnet2ID}`,
			},
			{
				Namespace: "aws:elasticbeanstalk:environment",
				OptionName: "ServiceRole",
				Value: "aws-elasticbeanstalk-service-role",
			},
			{
				Namespace: "aws:autoscaling:launchconfiguration",
				OptionName: "InstanceType",
				Value: instanceType,
			},
			{
				Namespace: "aws:autoscaling:launchconfiguration",
				OptionName: "IamInstanceProfile",
				Value: "aws-elasticbeanstalk-ec2-role",
			},
			{
				Namespace: "aws:elasticbeanstalk:application:environment",
				OptionName: "NODE_ENV",
				Value: "production",
			},
			{
				Namespace: "aws:elasticbeanstalk:application:environment",
				OptionName: "VITE_APP_TITLE",
				Value: viteAppTitle,
			},
		],
	};

	if (createDb) {
		input.OptionSettings.push({
			Namespace: "aws:ec2:vpc",
			OptionName: "DBSubnets",
			Value: `${vpcOutputs.PrivateSubnet1ID},${vpcOutputs.PrivateSubnet2ID}`,
		});
		input.OptionSettings.push({
			// ConfigurationOptionSetting
			Namespace: "aws:rds:dbinstance",
			OptionName: "DBInstanceClass",
			Value: "db.t3.small",
		});
		input.OptionSettings.push({
			// ConfigurationOptionSetting
			Namespace: "aws:rds:dbinstance",
			OptionName: "DBEngine",
			Value: "postgres",
		});
		input.OptionSettings.push({
			// ConfigurationOptionSetting
			Namespace: "aws:rds:dbinstance",
			OptionName: "MultiAZDatabase",
			Value: false,
		});
		input.OptionSettings.push({
			// ConfigurationOptionSetting
			Namespace: "aws:rds:dbinstance",
			OptionName: "HasCoupledDatabase",
			Value: false,
		});
	}

	const createCommand = new CreateEnvironmentCommand(input);
	const createResponse = await client.send(createCommand);
	console.log(
		chalk.green(`Successfully created environment ${envName}.`),
		createResponse
	);

	return createResponse;
}
