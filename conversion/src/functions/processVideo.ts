import { app, InvocationContext } from "@azure/functions";

export async function processVideo(queueItem: unknown, context: InvocationContext): Promise<void> {
    context.log('Storage queue function processed work item: ', queueItem);
}

app.storageQueue('processVideo', {
    queueName: 'videos',
    connection: 'signflixvideoqueue_STORAGE',
    handler: processVideo
});
