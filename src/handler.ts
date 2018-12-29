export function githubResponseHandler(
  event: any,
  context: any,
  callback: any,
): void {
  console.log(`Event: ${JSON.stringify(event)}`);
  // Grab body from event
  const body: any = JSON.parse(event.body);
  console.log(`Event body: ${JSON.stringify(body)}`);

  const pullRequestAction: string = body.action;
  // Provide success statusCode/Message
  const success: object = {
    body: "Successfully retrieved event",
    statusCode: "200"};
  callback(null, success);
}
