/**
 * @author Ethan T Painter
 * @description Constructs title from GitHub event
 * @param event Event from GitHub webhook
 * @returns String of the title stored in the event
 */
export function getTitle(event: any): string {
  try {
    const title: string = event.pull_request.title;
    return title;
  }
  catch (error) {
    throw new Error("Pull Request or Pull Request title not included in event");
  }
}
