// quick lambda func that logs the size of a file when it receives a lambda event
const stack = process.env.STACK_NAME || "unknown"; // You can pass env vars!

exports.handler = async (event) => {
    try {
        console.log(`Processing ${event.Records.length} message(s) from ${stack} stack...`);
        for (const record of event.Records) {
            const bucket = record.s3.bucket.name;

            const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));

            // This is what you wanted: the file size!
            const size = record.s3.object.size;

            // Also useful to log the event name (e.g., "ObjectCreated:Put")
            const eventName = record.eventName;

            // Print the formatted log to CloudWatch
            console.log(`Event: ${eventName} | Bucket: ${bucket} | Key: ${key} | Size: ${size} bytes`);
        }
        console.log("Processing complete.");
    } catch (error) {
        console.error("Error: could not parse event", error);
        return { status: "error" };
    }
};