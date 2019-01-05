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
