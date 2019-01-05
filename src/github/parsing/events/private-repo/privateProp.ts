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
