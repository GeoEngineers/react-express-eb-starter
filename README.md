# Express Server with React front end and easy Elastic Beanstalk deployment

Please fork this repo to get started.

## About

This repo includes code and templates for creating an Express Node app with a React client. It is designed to make setting up a local development environment as simple as possible.

Included are instructions and infrastructure-as-code templates for setting up and deploying the app to Elastic Beanstalk on AWS in a secure VPC.

<!-- Instructions for including an optional database are included. -->

## Usage

Install dependencies

```
npm install
```

Start the server and the client with a single command:

```
npm run dev
```

To create bundled assets and serve, run the build command and then start the server:

```
npm run build
npm start
```

## Setting up an Elastic Beanstalk environment

### Prerequisites

These instructions make heavy use of AWS command line tools. Please install the following and configure them to work with your AWS account before starting.

- AWS CLI [Installation instructions](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
- Elastic Beanstalk CLI [Installation instructions](https://github.com/aws/aws-elastic-beanstalk-cli-setup)

### Create the VPC and subnets

Elastic Beanstalk environments should be created inside a Virtual Private Cloud on AWS. An applicaiton can be launched in the default VPC for an account; however, additional subnets might need to be created. This tutorial recommends creating a separate VPC for each application. It is NOT recommended to launch applications in the `ec2-classic` network, as this network will be depracated in August 2022.

Use AWS CLI and Cloudformation to create a VPC. Inspect `vpc-cloudformation-template.yaml` in this repo to see what resources it creates.

To use AWS CLI's Cloudformation tool, the template needs to be uploaded to a web server. Create a bucket and upload the template to it using the following commands:

```
aws s3 mb s3://cloudformation-templates-[your-app-name]
aws s3 cp vpc-cloudformation-template.yaml s3://cloudformation-templates-[your-app-name]  
```

The template should now be available at https://s3.amazonaws.com/cloudformation-templates-[your-app-name]/vpc-cloudformation-template.yaml. 

Now the VPC can be created by referencing the template. The template also includes a parameter for the base CIDR block, `paramVPCCidrBlockBase`, which should be passed with the `create-stack` command. The CIDR block limits the number of IP addresses that are available in the VPC, which makes it easier prevent overlapping CIDR blocks with other VPCs. This can be useful later if VPCs need to be paired.  Replace "your-app-vpc-name" with the VPC name you'd like for this cloudformation.  Replace [your cidr block base, e.g. 10.11.0.0/16] with the CIDR block range you'd like for this cloudformation, reference the current VPCs to ensure it does not exist yet.

```
aws cloudformation create-stack --stack-name "your-app-vpc-name" --template-url https://s3.amazonaws.com/cloudformation-templates-[your-app-name]/vpc-cloudformation-template.yaml --parameters ParameterKey=paramVPCCidrBlockBase,ParameterValue=[your cidr block base, e.g. 10.11.0.0/16]
```
This begins the stack creation process, which will take a few minutes. Check the progress of the stack creation process using the following command:

```
aws cloudformation describe-stacks --stack-name your-app-vpc-name
```

Once the `StackStatus` value has changed to `CREATE_COMPLETE`, the description should also include an "Outputs" property. The values here will be used in the next step, so copying and pasting them into a scratch pad is a good idea.

One other piece of information will be required when creating an environment in the next step: The ID of the default security group that is created by AWS when the VPC is created. This can be queried using the following command:

```
aws ec2 describe-security-groups --filters Name=vpc-id,Values=[your-new-vpc-id]
```

Stash this value somewhere.

### Create the Elastic Beanstalk application and environment

An Elastic Beanstalk app consists of an Application that can contain any number of Environments. The Environment defines the actual infrastructre that will run the application. For instance, an application could contain Production and Development environments.

The Elastic Beanstalk app can be managed entirely via the command line. The EB CLI has many functions, but this tutorial will focus on getting an application up and running as quickly as possible. 

#### Create the application

To initialize our project as an EB application, use the following command:

```
eb init
```

The command will ask several questions, including default region, application name, whether the project will use CodeCommit and if SSH should be set up for the project instances. If SSH support is selected, a key pair (.pem file) will either need to be selected or created.

The CLI might ask for an AWS access key and secret. These can be created in the AWS IAM console, or use the key and secret from your `~.aws/credentials` file.

Once the `init` process is complete, the application is created and can be viewed in the AWS Elastic Beanstalk web console. These settings can be reviewed in `.elasticbeanstalk/config.yml`.

#### Create the environment

The following are suggested defaults for a simple web server running Node. The command will require several of the outputs from the earlier VPC creation step.

```
eb create new-env-name -i t1.micro -p node.js-14 --elb-type application -im 1 -ix 1 --vpc.id your-vpc-id --vpc.ec2subnets PrivateSubnet1ID,PrivateSubnet2ID --vpc.elbsubnets PublicSubnet1ID,PublicSubnet2ID --vpc.securitygroup security-group-id --vpc.elbpublic --envvars NODE_ENV=production 
```
#### Optional: Create the environment with a database

```
eb create new-env-name -i t1.micro -p node.js-14 --elb-type application -im 1 -ix 1 --vpc.id your-vpc-id --vpc.ec2subnets PrivateSubnet1ID,PrivateSubnet2ID --vpc.elbsubnets PublicSubnet1ID,PublicSubnet2ID --vpc.securitygroup security-group-id --vpc.elbpublic --envvars NODE_ENV=production --database --vpc.dbsubnets PrivateSubnet1ID,PrivateSubnet2ID --database.engine postgres --database.instance db.t3.micro
```

This will start the EB environment creation process and the CLI will ask a few more questions about the database. Most defaults are acceptable, however, leaving the password field blank will result in a password being generated by the CLI. This password will be automatically supplied to the Node app via environment variables, however, it is recommended that the user supply a password, as this will make it easier to access the database from the command line outside of the app itself.

Once this step has completed, the app should be running in the cloud. To visit the app, use the command `eb open`.

### Add custom URL

While the endpoint provided by `eb open` works, most users want to create a custom URL for their apps. This can be done in a few simple steps.

#### Retrieve the load balancer endpoint

The Elastic Beanstalk environment is created with both a direct endpoint and a load balancer endpoint. The load balancer endpoint is what should be used when forwarding traffic from a custom URL. The load balancer endpoint can be retrieved by first fetching the load balancer name:

```
aws elasticbeanstalk describe-environment-resources --environment-name new-env-name
```

This will return a list of several of the resources associated with the EB environment. Note the LoadBalancer ARN.

Now retrieve details about the load balancer using the following command:

```
aws elbv2 describe-load-balancers --load-balancer-arns environment-load-balancer-arn
```

Note the `DNSName` value. This is the value that the custom URL will point to.

#### Create custom URL in Route53

This tutorial assumes the user already has a domain name registered in Route53 and is creating a new subdomain to point to the Load Balancer endpoint. Other custom domain setups works similarly.

Creating a new A record in Route53 can be done via the CLI, however, it is rather cumbersome and this tutorial recommends using the AWS web console:

1) Navigate to the dashboard for the desired hosted zone.
2) Click on the Create Record button
3) Under Record Name, provide a subdomain (or leave blank to create a record for the root domain)
4) Under Record Type, select A
5) Under Route Traffic To, be sure to toggle the Alias option
6) In the Choose Endpoint box, select Alias to Classic and Applicaiton Load Balancer
7) In the Choose Region box, select the correct region
8) In the Choose Load Balancer box, select the DNS name retreived in the prior step
9) Click the Create Record button

The DNS record is now created, and once the record propogates, the new Route53 endpoint should resolve to the load balancer endpoint, which in turn resolves to the Elastic Beanstalk instance.

**Note:** For domains that also represent an internal network, a new record will also need to be created in your internal DNS.

### Securing the app with SSL

- create SSL cert
- create HTTPS listener on load balancer using the new SSL cert
- forward HTTP listener to HTTPS

### Connect to database from GSK

- Create VPC pairing connection from GeoMaster
- Accept VPC pairing connection from child account
- Update GSK subnet route table to direct child VPC IP cidr block traffic to peering connection
- Update child database subnet route table to direct cidr block traffic for GSK to peering connection
- Update child database security group settings to allow traffic from GSK security group in GeoMaster account

### Add Office365 authentication

## Prior art

https://medium.com/@wlto/how-to-deploy-an-express-application-with-react-front-end-on-aws-elastic-beanstalk-880ff7245008

Copyright (c) 2023 GeoEngineers, Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.