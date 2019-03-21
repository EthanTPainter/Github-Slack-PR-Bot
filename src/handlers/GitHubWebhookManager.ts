
/**
 * @description Processes GitHub Webhook POST requests
 * and sends each through to an SNS for processing
 * @param event Lambda Event
 * @param context Lambda context
 * @param callback Lambda callback
 */
export async function processGitHubWebhookEvent(
  event: any,
  context: any,
  callback: any,
): Promise<void> {
}
