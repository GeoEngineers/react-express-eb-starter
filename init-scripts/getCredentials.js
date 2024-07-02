import { fromNodeProviderChain } from "@aws-sdk/credential-providers";
// import { readFileSync } from "fs";
import chalk from "chalk";
// import { resolve } from "path";
import inquirer from "inquirer";

async function getCredentials({ profile, region }) {
	// console.log("mfaDeviceArn", mfaDeviceArn);
	const credentials = fromNodeProviderChain({
		profile,
		region,
		mfaCodeProvider: promptForMFACode,
	});

	return credentials;
}

async function promptForMFACode(mfaSerial) {
	console.log(chalk.yellow(`Enter your MFA code for ${mfaSerial}:`));
	const { tokenCode } = await inquirer.prompt([
		{
			type: "password",
			name: "tokenCode",
			message: "Enter your MFA code (DO NOT REUSE CODES!):",

			validate: (value) => {
				if (value.length === 6 && /^\d+$/.test(value)) {
					return true;
				}
				return "Please enter a valid 6-digit MFA code.";
			},
		},
	]);

	return tokenCode;
}

// Example usage
export default getCredentials;
