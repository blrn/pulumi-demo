import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";

export interface SqsArgs {
    queueName: string;
}

export class Sqs extends pulumi.ComponentResource {
    public readonly queueUrl: pulumi.Output<string>;
    public readonly queueArn: pulumi.Output<string>;

    constructor(name: string, args: SqsArgs, opts?: pulumi.ComponentResourceOptions) {
        super("infra-challenge:index:Sqs", name, args, opts);

        const queue = new aws.sqs.Queue(`${name}-queue`, {
            name: args.queueName,
        }, {parent: this});

        this.queueUrl = queue.url;
        this.queueArn = queue.arn;
    }
}