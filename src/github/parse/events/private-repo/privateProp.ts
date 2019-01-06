/**
 * @author EThan T Painter
 * @description From the event, retrieve the private property (boolean)
 *              This will tell us if the repository is private or public
 * @param event Event sent from the GitHub webhook
 */
export function getPrivateProp(event: any): boolean {
  if (event === undefined) {
    throw new Error("event is undefined");
  }
  if (event.repository === undefined) {
    throw new Error("event.repository is undefined");
  }
  if (event.repository.private === undefined) {
     throw new Error("event.repository.private is undefined");
  }
  const privateVal: boolean = event.repository.private;
  return privateVal;
}
