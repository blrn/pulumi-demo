exports.handler = async (event) => {
    const stack = process.env.STACK_NAME || "unknown"; // You can pass env vars!
    const helloWord = process.env.APP_LOCALE === "en_AU" ? "G'Day" : "Hello";

    console.log(`Processing ${event.Records.length} message(s) from ${stack} stack...`);

    for (const record of event.Records) {
        console.log(`Message ID: ${record.messageId}`);
        console.log(`Body: ${record.body}`);

        console.log(`${helloWord}, ${record.body}!`);

    }

    console.log("Processing complete.");
    return { status: "ok" };
};