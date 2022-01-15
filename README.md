# :construction: WORK IN PROGRESS :construction:

# Express-React App with Elastic Beanstalk Template

Please fork this repo to get started.

## About

This repo includes code and templates for creating an Express node app with a React client. It is designed to make setting up a local development environment as simple as possible.

Included are instructions and infrastructure-as-code templates for setting up and deploying the app to Elastic Beanstalk on AWS in a secure VPC.

Instructions for including an optional database are included.

## Usage

Install [nodemon](https://nodemon.io/) globally

```
npm install nodemon -g
```

Install server and client dependencies

```
npm install
cd client
npm install
```

Start the server and the client with a single command:

```
npm run dev
```

Run the production build on localhost. This will create a production build, then Node will serve the app on http://localhost:3001.

## Setting up an Elastic Beanstalk environment

### Prerequisites

These instructions make heavy use of AWS command line tools. Please install the following to before starting.

- AWS CLI [Installation instructions](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
- Elastic Beanstalk CLI [Installation instructions](https://github.com/aws/aws-elastic-beanstalk-cli-setup)

### Create the VPC and subnets

For security, Elastic Beanstalk environments should be created inside a Virtual Private Cloud on AWS. 

Use the AWS CLI and Cloudformation to create a VPC. Inspect `vpc-cloudformation-template.yaml` to see what resources it creates.

To use the AWS CLI's Cloudformation tool, the template needs to be uploaded to a web server. Create a bucket and upload the template to it using the following commands:

```
aws s3 mb s3://cloudformation-templates-[your-app-name]
aws s3 cp vpc-cloudformation-template.yaml s3://cloudformation-templates-[your-app-name]  
```

The template should now be available at https://s3.amazonaws.com/cloudformation-templates-[your-app-name]/vpc-cloudformation-template.yaml. 

Now the VPC can be created by referencing the template. The template also includes a parameter for the base CIDR block, `paramVPCCidrBlockBase`, which should be passed with the `create-stack` command. The CIDR block limits the number of IP addresses that are available in the VPC, which makes it easier prevent overlapping CIDR blocks with other VPCs.

```
aws cloudformation create-stack --stack-name "your-app-vpc-name" --template-url https://s3.amazonaws.com/cloudformation-templates-[your-app-name]/vpc-cloudformation-template.yaml --parameters ParameterKey=paramVPCCidrBlockBase,ParameterValue=[your cidr block base, e.g. 10.11.0.0/16]
```

Check progress of the cloudformation stack creation process:

```
aws cloudformation describe-stacks --stack-name your-app-vpc-name
```

Once the `StackStatus` value has changed to `CREATE_COMPLETE`, the description should also include an "Outputs" property. The values here will be used in the next step, so copying and pasting them into a scratch pad is a good idea.

One other piece of information will be required when creating an environment later: The ID of the default security group that is created by AWS when the VPC is created. This can be queried using the following command:

```
aws ec2 describe-security-groups --filters Name=vpc-id,Values=[your-new-vpc-id]
```

Stash this value somewhere.

### Create the Elastic Beanstalk application and environment

An Elastic Beanstalk app consists of an Application that can contain any number of Environments. The Environment defines the actual infrastructre that will run the application.

The Elastic Beanstalk app can be managed entirely via the command line. The EB CLI has many functions, but this tutorial will focus on getting an application up and running as quickly as possible. 

#### Create the application

To initialize our project as an EB application, use the following:

```
eb init
```

The command will ask several questions, including default region, application name, whether the project will use CodeCommit and if SSH should be set up for the project instances. If SSH support is selected, a key pair (.pem file) will either need to be selected or created.

The CLI might ask for an AWS access key and secret. These can be created in the AWS IAM console.

Once the `init` is complete, the application is created and can be viewed in the AWS Elastic Beanstalk console. These settings can be reviewed in `.elasticbeanstalk/config.yml`.

#### Create the environment

The following are suggested defaults for a simple web server running Node. The command will require several of the outputs from the earlier VPC creation step.

```
eb create test-dev -i t1.micro -p node.js-14 --elb-type application -im 1 -ix 1 --vpc.id vpc-0bda0d66e858cd855 --vpc.ec2subnets subnet-0b0402f6de52fce81,subnet-0ca2ea82a195604e3 --vpc.elbsubnets subnet-0e04dc57d6c377c8c,subnet-0087207d34ff5a424 --vpc.securitygroup sg-08d615a01b5e82ca1 --vpc.elbpublic --envvars NODE_ENV=production
```

Fetch both the EB url and the ELB url.

### Add custom URL, SSL to load balancer for HTTPS

// create custom url in Route53
// create SSL cert
// create HTTPS listener on load balancer
// forward HTTP listener to HTTPS

### Add a database

### Add Office365 authentication

<!-- "Outputs": [
                {
                    "OutputKey": "PubPrivateVPCID",
                    "OutputValue": "vpc-0bda0d66e858cd855",
                    "Description": "VPC ID",
                    "ExportName": "BeanstalkVPCID"
                },
                {
                    "OutputKey": "PublicSubnet1ID",
                    "OutputValue": "subnet-0e04dc57d6c377c8c",
                    "Description": "Public Subnet A ID",
                    "ExportName": "BeanstalkPublicSubnet1ID"
                },
                {
                    "OutputKey": "PublicSubnet2ID",
                    "OutputValue": "subnet-0087207d34ff5a424",
                    "Description": "Public Subnet B ID",
                    "ExportName": "BeanstalkPublicSubnet2ID"
                },
                {
                    "OutputKey": "PrivateSubnet2ID",
                    "OutputValue": "subnet-0ca2ea82a195604e3",
                    "Description": "Private Subnet B ID",
                    "ExportName": "BeanstalkPrivateSubnet2ID"
                },
                {
                    "OutputKey": "PrivateSubnet1ID",
                    "OutputValue": "subnet-0b0402f6de52fce81",
                    "Description": "Private Subnet A ID",
                    "ExportName": "BeanstalkPrivateSubnet1ID"
                }
            ], -->
