/**
 * @description Constructs url from GitHub event
 * @param event Event from GitHub webhook
 * @returns String of the url stored in the event
 */
export function getPRLink(event: any): string {
  if (event === undefined) {
    throw new Error("event is undefined");
  }
  if (event.pull_request === undefined) {
    throw new Error("event.pull_request is undefined");
  }
  if (event.pull_request.html_url === undefined) {
    throw new Error("event.pull_request.html_url is undefined");
  }
  try {
    const url: string = event.pull_request.html_url;
    return url;
  }
  catch (error) {
    throw new Error("event.pull_request.html_url not found in event");
  }
}
