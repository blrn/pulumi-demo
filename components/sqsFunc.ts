import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import {LambdaFunc, LambdaFuncArgs} from "./lambda";
import {Sqs} from "./sqs";

export interface SqsFuncArgs {
    lambda: LambdaFuncArgs;
    queueName: string;
    batchSize?: number;
}

export class SqsFunc extends pulumi.ComponentResource {
    public readonly queueUrl: pulumi.Output<string>;
    public readonly queueArn: pulumi.Output<string>;
    public readonly lambdaArn: pulumi.Output<string>;
    constructor(name: string, args: SqsFuncArgs, opts?: pulumi.ComponentResourceOptions) {
        super("infra-challenge:index:SqsFunc", name, args, opts);
        const lambdaFunc = new LambdaFunc(`${name}-lambda`, args.lambda, {parent: this});

        const sqsRPA = new aws.iam.RolePolicyAttachment(`${name}-sqs-policy`, {
            role: lambdaFunc.roleName,
            policyArn: aws.iam.ManagedPolicy.AWSLambdaSQSQueueExecutionRole,
        }, {parent: this});

        const queue = new Sqs(`${name}-queue`, {queueName: args.queueName}, {parent: this});

        const eventSrcMap = new aws.lambda.EventSourceMapping(`${name}-trigger`, {
            eventSourceArn: queue.queueArn,
            functionName: lambdaFunc.lambdaArn,
            batchSize: args.batchSize ?? 5,
        }, {parent: this});

        this.queueUrl = queue.queueUrl;
        this.queueArn = queue.queueArn;
        this.lambdaArn = lambdaFunc.lambdaArn;

        this.registerOutputs({
            queueUrl: this.queueUrl,
            queueArn: this.queueArn,
            lambdaArn: this.lambdaArn,
        });
    }
}