
export class Base {

  /**
   * @author Ethan T Painter
   * @description Constructs title from GitHub event
   * @param event Event from GitHub webhook
   * @returns String of the title stored in the event
   */
  getTitle(event: any): string {
    try {
      const title: string = event.pull_request.title;
      return title;
    }
    catch (error) {
      throw new Error("Pull Request or Pull Request title not included in event");
    }
  }

  /**
   * @author EThan T Painter
   * @description Constructs url from GitHub event
   * @param event Event from GitHub webhook
   * @returns String of the url stored in the event
   */
  getPRLink(event: any): string {
    try {
      const url: string = event.pull_request.url;
      return url;
    }
    catch (error) {
      throw new Error("");
    }
  }
}
