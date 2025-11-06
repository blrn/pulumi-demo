import * as pulumi from "@pulumi/pulumi";

import {SqsFunc} from "./components/sqsFunc";
import {BucketFunc} from "./components/bucketFunc";

const config = new pulumi.Config();
const logRetention = config.requireNumber("logRetention");
const greeterBatchSize = config.requireNumber("greeterBatchSize");
const greeterQueueName = config.require("greeterQueueName");
const greeterLocale = config.require("greeterLocale");
const stack = pulumi.getStack();

const greeterFunc = new SqsFunc("greeter", {
    queueName: greeterQueueName,
    batchSize: greeterBatchSize,
    lambda: {
        codePath: "./src/greeter-func/",
        handler: "index.handler",
        runtime: "nodejs20.x",
        logRetentionDays: logRetention,
        environment: {
            STACK_NAME: stack,
            APP_LOCALE: greeterLocale,
        }
    }
});

const sizerFunc = new BucketFunc("sizer", {
    bucketName: `sizer-bucket-${stack}`,
    lambda: {
        codePath: "./src/sizer-func/",
        handler: "index.handler",
        runtime: "nodejs20.x",
        logRetentionDays: logRetention,

        environment: {
            STACK_NAME: stack,
        },
    },
    s3Events: ["s3:ObjectCreated:*"],
});

console.log(`Stack: ${stack}`);
console.log(`Global log retention: ${logRetention} days`);
console.log(`Greeter batch size: ${greeterBatchSize}`);
console.log(`Greeter queue name: ${greeterQueueName}`);
console.log(`Greeter locale: ${greeterLocale}`);

export const greeterFuncQueueUrl = greeterFunc.queueUrl;
export const greeterFuncLambdaArn = greeterFunc.lambdaArn;
export const sizerFuncBucketArn = sizerFunc.bucketArn;
export const sizerFuncBucketName = sizerFunc.bucketName;
export const sizerFuncLambdaArn = sizerFunc.lambdaArn;