import { Item, TeamOptions } from "../../../../../models";

/**
 * @description Construct a pr string given a pullRequest
 * @param pullRequest Item model
 * @param options TeamOptions model
 * @returns string of the queue PR
 */
export function constructQueueString(
  pullRequest: Item,
  options: TeamOptions,
): string {

  let prString = "";
  const includeCreatedTime = options.Include_Created_Time;
  const includeUpdatedTime = options.Include_Updated_Time;
  const includeOwner = options.Include_Owner;

  const createdDateTime = pullRequest.records.times[0];
  const updatedDateTime = pullRequest.records.times[pullRequest.records.times.length - 1];
  const owner = pullRequest.owner;

  // PR String base
  prString = `${pullRequest.title} [${pullRequest.url}] `;

  // Include PR Owner, Created & Updated times
  if (includeOwner && includeCreatedTime && includeUpdatedTime){
    prString += `(Owner: ${owner.Slack_Name}, Created: ${createdDateTime}, `
      + `Updated: ${updatedDateTime})\n`;
  }

  // Include both created and updated times
  else if (includeCreatedTime && includeUpdatedTime) {
    prString += `(Created: ${createdDateTime}, Updated: ${updatedDateTime})\n`;
  }
  // Include Owner and created date time
  else if (includeOwner && includeCreatedTime) {
    prString += `(Owner: ${owner.Slack_Name}, Created: ${createdDateTime})`;
  }
  // Include Owner and Updated date time
  else if (includeOwner && includeUpdatedTime) {
    prString += `(Owner: ${owner.Slack_Name}, Updated: ${updatedDateTime})`;
  }

  // Include only created time
  else if (includeCreatedTime) {
    prString += `(Created: ${createdDateTime})\n`;
  }
  // Include only updated time
  else if (includeUpdatedTime) {
    prString += `(Updated: ${updatedDateTime})\n`;
  }
  else if (includeOwner) {
    prString += `(Owner: ${owner.Slack_Name})\n`;
  }

  return prString;
}
