/**
 * @author EThan T Painter
 * @description Constructs url from GitHub event
 * @param event Event from GitHub webhook
 * @returns String of the url stored in the event
 */
export function getPRLink(event: any): string {
  try {
    const url: string = event.pull_request.html_url;
    return url;
  }
  catch (error) {
    throw new Error("event.pull_request.html_url not found in event");
  }
}
