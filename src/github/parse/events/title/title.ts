/**
 * @description Constructs title from GitHub event
 * @param event Event from GitHub webhook
 * @returns String of the title stored in the event
 */
export function getTitle(event: any): string {
  if (event === undefined) {
    throw new Error("event is undefined");
  }
  if (event.pull_request === undefined) {
    throw new Error("event.pull_request is undefined");
  }
  if (event.pull_request.title === undefined) {
    throw new Error("event.pull_request.title is undefined");
  }
  const title: string = event.pull_request.title;
  return title;
}
