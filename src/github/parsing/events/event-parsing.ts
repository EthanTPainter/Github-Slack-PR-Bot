/**
 * @author Ethan T Painter
 * @description Provides additional functionality for extracting
 *              GitHub event property values
 */

/**
 * @author EThan T Painter
 * @description From the event, retrieve the private property (boolean)
 *              This will tell us if the repository is private or public
 * @param event Event sent from the GitHub webhook
 */
export function getPrivateProp(event: any): boolean {
  try {
    const privateVal: boolean = event.repository.private;
    return privateVal;
  }
  catch (error) {
    throw new Error("Cannot determine if the repository is public or private");
  }
}

/**
 * @author Ethan T Painter
 * @description Retrieve core path and modify for API request
 * @param event Event recevied from the GitHub webhook
 * @returns string of the path for GET requests using GitHub API
 */
export function getPath(event: any): string {
  try {
    const fullUrl: string = event.pull_request.url;
    const reviewsUrl: string = fullUrl + "/reviews";
    return reviewsUrl;
  }
  catch (error) {
    throw new Error("Unable to construct path for GitHub API GET request");
  }
}
