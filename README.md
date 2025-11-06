# Infrastructure as Code Challenge

This is a project setup to demo Pulumi and deploying infrastructure to AWS.
It manages 2 simple AwS Lambda functions, they are:

* **greeter**: takes a name as input and logs a greeting, currently triggered by an SQS message
* **file sizer**: Logs the size of a file uploaded to S3, currently triggered by an S3 event

These were chosen to show how using components in Pulumi allows for reuse


 ## Requirements

 - Pulumi CLI (>= v3): https://www.pulumi.com/docs/get-started/install/
 - Node.js (>= 14): https://nodejs.org/
 - AWS credentials configured (e.g., via `aws configure` or environment variables)

 ## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Select the correct stack (e.g., `dev` or `prod`): `pulumi stack select <stack>`
4. Preview the deployment `pulumi preview`
5. Deploy the stack `pulumi up`

 ## Project Layout

 - `Pulumi.yaml` Pulumi project and template metadata
 - `Pulumi.dev.yaml` Pulumi stack configuration for the dev stack
 - `Pulumi.prod.yaml` Pulumi stack configuration for the prod stack
 - `components/` Pulumi Components
 - `src/` Application source code
 
 ## Configuration

 | Key                                       | Description                             | Default     |
 |-------------------------------------------|-----------------------------------------|-------------|
 | `aws:region`                              | The AWS region to deploy resources into | `us-east-1` |
 | `pulumi-infra-challenge:logRetention`     | The log retentikon in days for all apps | `5`           |
 | `pulumi-infra-challenge:greeterQueueName` | The name of the SQS Queue               |             |
 | `pulumi-infra-challenge:greeterBatchSize` | The batch size of the greeter function  | `5`           |
 | `pulumi-infra-challenge:greeterLocale`    | The locale for the greeter function     | `en_US`     |

 Use `pulumi config set <key> <value>` to customize configuration.
