import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import {LambdaFunc, LambdaFuncArgs} from "./lambda";
import {S3Bucket} from "./bucket";

export interface BucketFuncArgs {
    lambda: LambdaFuncArgs;
    bucketName: string;

    s3Events?: string[];
    s3FilterPrefix?: string;
}

export class BucketFunc extends pulumi.ComponentResource {
    public readonly bucketArn: pulumi.Output<string>;
    public readonly bucketName: pulumi.Output<string>;
    public readonly lambdaArn: pulumi.Output<string>;

    constructor(name: string, args: BucketFuncArgs, opts?: pulumi.ComponentResourceOptions) {
        super("infra-challenge:index:BucketFunc", name, args, opts);

        const lambdaFunc = new LambdaFunc(`${name}-lambda`, args.lambda, {parent: this});

        // readonlyc access to the bucket for the lambda
        new aws.iam.RolePolicyAttachment(`${name}-s3-read-policy`, {
            role: lambdaFunc.roleName,
            policyArn: aws.iam.ManagedPolicy.AmazonS3ReadOnlyAccess,
        }, {parent: this});

        const bucket = new S3Bucket(`${name}-bucket`, {name: args.bucketName}, {parent: this});

        // allow s3 to trigger the lambda
        new aws.lambda.Permission(`${name}-s3-permission`, {
            action: "lambda:InvokeFunction",
            principal: "s3.amazonaws.com",
            sourceArn: bucket.bucketArn,
            function: lambdaFunc.lambdaArn,
        }, {parent: this});

        // configure the trigger
        const trigger = new aws.s3.BucketNotification(`${name}-notification`, {
            bucket: bucket.bucketId,
            lambdaFunctions: [{
                lambdaFunctionArn: lambdaFunc.lambdaArn,
                events: args.s3Events ?? ["s3:ObjectCreated:*"], // Default to new objects
                filterPrefix: args.s3FilterPrefix,
            }],
        }, {
            parent: this,
            dependsOn: [lambdaFunc] // Ensure Lambda exists before setting trigger
        });

        this.bucketArn = bucket.bucketArn;
        this.bucketName = bucket.bucketId;
        this.lambdaArn = lambdaFunc.lambdaArn;
        this.registerOutputs({
            bucketArn: this.bucketArn,
            bucketName: this.bucketName,
            lambdaArn: this.lambdaArn,
        });
    }

}
