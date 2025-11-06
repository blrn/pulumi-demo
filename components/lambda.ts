import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";

const stack = pulumi.getStack();

export interface LambdaFuncArgs {
    codePath: string;
    runtime: string;
    handler?: string;
    environment?: {[key: string]: string};
    logRetentionDays: number;

}

export class LambdaFunc extends pulumi.ComponentResource {
    public readonly roleName: pulumi.Output<string>;
    public readonly roleArn: pulumi.Output<string>;
    public readonly logGroupName: pulumi.Output<string>;
    public readonly lambdaArn: pulumi.Output<string>;

    constructor(name: string, args: LambdaFuncArgs, opts?: pulumi.ComponentResourceOptions) {
        super("infra-challenge:index:LambdaJob", name, args, opts);
        
        const lambdaRole = new aws.iam.Role(`${name}-role`, {
            assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal({
                Service: "lambda.amazonaws.com",
            }),
        }, {parent: this});

        const logRPA = new aws.iam.RolePolicyAttachment(`${name}-logs-policy`, {
            role: lambdaRole.name,
            policyArn: aws.iam.ManagedPolicy.CloudWatchLogsFullAccess,
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

        this.roleName = lambdaRole.name;
        this.roleArn = lambdaRole.arn;
        this.logGroupName = logGroup.name;
        this.lambdaArn = lambdaFunc.arn;


    }
}