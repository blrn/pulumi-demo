import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";

const stack = pulumi.getStack();


export interface AwsSqsJobArgs {
    codePath: string;
    runtime: string;
    handler?: string;
    queueName: string;
    logRetentionDays: number;
    batchSize: number;
    environment?: {[key: string]: string};
    logTags?: {[key: string]: string};
}

export class AwsSqsJob extends pulumi.ComponentResource {
    public readonly queueUrl: pulumi.Output<string>;
    public readonly queueArn: pulumi.Output<string>;
    public readonly lambdaArn: pulumi.Output<string>;


    constructor(name: string, args: AwsSqsJobArgs, opts?: pulumi.ComponentResourceOptions) {
        super("infra-challenge:index:AwsLambdaJob", name, args, opts);
        // IAM role for the lambda function
        const lambdaRole = new aws.iam.Role(`${name}-role`, {
            assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal({
                Service: "lambda.amazonaws.com",
            }),
        }, {parent: this});


        const sqsRPA = new aws.iam.RolePolicyAttachment(`${name}-sqs-policy`, {
            role: lambdaRole.name,
            policyArn: aws.iam.ManagedPolicy.AWSLambdaSQSQueueExecutionRole,
        }, {parent: this});

        const logRPA = new aws.iam.RolePolicyAttachment(`${name}-logs-policy`, {
            role: lambdaRole.name,
            policyArn: aws.iam.ManagedPolicy.CloudWatchLogsFullAccess,
        }, {parent: this});

        const queue = new aws.sqs.Queue(`${name}-queue`, {
            name: args.queueName,
        }, {parent: this});

        const logGroup = new aws.cloudwatch.LogGroup(`${name}-log-group`, {
            name: pulumi.interpolate`/aws/lambda/${name}/${stack}`,
            tags: {
                "project": pulumi.getProject(),
                "stack": stack,
            },
            retentionInDays: args.logRetentionDays,
        }, {parent: this});

        const lambdaFunc = new aws.lambda.Function(`${name}-func`, {
            role: lambdaRole.arn,
            runtime: args.runtime,
            handler: args.handler ?? "index.handler",
            code: new pulumi.asset.AssetArchive({
                ".": new pulumi.asset.FileArchive(args.codePath)
            }),
            environment: {
                variables: args.environment ?? {},
            },
            loggingConfig: {
                logGroup: logGroup.name,
                logFormat: "JSON",


            },
        }, {parent: this});

        const eventSrcMap = new aws.lambda.EventSourceMapping(`${name}-trigger`, {
            eventSourceArn: queue.arn,
            functionName: lambdaFunc.arn,
            batchSize: args.batchSize,
        }, {parent: this});

        this.queueUrl = queue.url;
        this.queueArn = queue.arn;
        this.lambdaArn = lambdaFunc.arn;

        this.registerOutputs({
            queueUrl: this.queueUrl,
            queueArn: this.queueArn,
            lambdaArn: this.lambdaArn,
        });
    }
}