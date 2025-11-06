import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";

const stack = pulumi.getStack();

export interface S3BucketArgs {
    name: string;
}

export class S3Bucket extends pulumi.ComponentResource {
    public readonly bucketArn: pulumi.Output<string>;
    public readonly bucketId: pulumi.Output<string>;
    constructor(name: string, args: S3BucketArgs, opts?: pulumi.ComponentResourceOptions) {
        super("infra-challenge:index:S3Bucket", name, args, opts);

        const bucket = new aws.s3.Bucket(`${name}-bucket`, {
            bucket: args.name,
        }, { parent: this });

        this.bucketArn = bucket.arn;
        this.bucketId = bucket.id;

        this.registerOutputs({
            bucketArn: this.bucketArn,
            bucketId: this.bucketId,
        });
    }
}