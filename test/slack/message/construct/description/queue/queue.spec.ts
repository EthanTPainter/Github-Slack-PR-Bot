import { expect } from "chai";
import { constructQueueString } from "../../../../../../src/slack/message/construct/description";
import { Item } from "../../../../../../src/models";

describe("constructQueueString", () => {

  let pullRequest: Item;

  beforeEach(() => {
    pullRequest = {
      owner: {
        Slack_Name: "User",
        Slack_Id: "<@12345>",
      },
      title: "Feature(123): Add new service",
      url: "www.github.com",
      member_complete: false,
      members_approving: [],
      lead_complete: false,
      leads_approving: [],
      records: {
        events: [{
          user: {
            Slack_Name: "EthanP",
            Slack_Id: "<@54321>",
          },
          action: "APPROVED",
        }],
        times: ["NOW"],
      },
    };
  });

  it("should construct a queue string with owner, created & updated times", () => {
    const options: any = {
      Include_Created_Time: true,
      Include_Updated_Time: true,
      Include_Owner: true,
    };

    const result = constructQueueString(pullRequest, options);

    expect(result.includes(pullRequest.title)).equal(true);
    expect(result.includes(pullRequest.url)).equal(true);
    expect(result.includes("Owner: " + pullRequest.owner.Slack_Name)).equal(true);
    expect(result.includes("Created: " + pullRequest.records.times[0])).equal(true);
    expect(result.includes("Updated: " + pullRequest.records.times[0])).equal(true);
  });

  it("should construct a queue string with owner and created date time", () => {
    const options: any = {
      Include_Created_Time: true,
      Include_Updated_Time: false,
      Include_Owner: true,
    };

    const result = constructQueueString(pullRequest, options);

    expect(result.includes(pullRequest.title)).equal(true);
    expect(result.includes(pullRequest.url)).equal(true);
    expect(result.includes("Owner: " + pullRequest.owner.Slack_Name)).equal(true);
    expect(result.includes("Created: " + pullRequest.records.times[0])).equal(true);
    expect(result.includes("Updated: " + pullRequest.records.times[0])).equal(false);
  });

  it("should construct a queue string with owner and updated date time", () => {
    const options: any = {
      Include_Created_Time: false,
      Include_Updated_Time: true,
      Include_Owner: true,
    };

    const result = constructQueueString(pullRequest, options);

    expect(result.includes(pullRequest.title)).equal(true);
    expect(result.includes(pullRequest.url)).equal(true);
    expect(result.includes("Owner: " + pullRequest.owner.Slack_Name)).equal(true);
    expect(result.includes("Created: " + pullRequest.records.times[0])).equal(false);
    expect(result.includes("Updated: " + pullRequest.records.times[0])).equal(true);
  });

  it("should construct a queue string with same created and updated time", () => {
    const options: any = {
      Include_Created_Time: true,
      Include_Updated_Time: true,
    };

    const result = constructQueueString(pullRequest, options);

    expect(result.includes(pullRequest.title)).equal(true);
    expect(result.includes(pullRequest.url)).equal(true);
    expect(result.includes("Owner: " + pullRequest.owner.Slack_Name)).equal(false);
    expect(result.includes("Created: " + pullRequest.records.times[0])).equal(true);
    expect(result.includes("Updated: " + pullRequest.records.times[0])).equal(true);
  });

  it("should construct a queue string with different created and updated times", () => {
    pullRequest.records.times.push("UPDATED");
    const options: any = {
      Include_Created_Time: true,
      Include_Updated_Time: true,
    };

    const result = constructQueueString(pullRequest, options);

    expect(result.includes(pullRequest.title)).equal(true);
    expect(result.includes(pullRequest.url)).equal(true);
    expect(result.includes("Created: " + pullRequest.records.times[0])).equal(true);
    expect(result.includes("Updated: " + pullRequest.records.times[0])).equal(false);
    expect(result.includes("Updated: " + pullRequest.records.times[1])).equal(true);
  });

  it("should construct a queue string with only created time", () => {
    const options: any = {
      Include_Created_Time: true,
      Include_Updated_Time: false,
    };

    const result = constructQueueString(pullRequest, options);

    expect(result.includes(pullRequest.title)).equal(true);
    expect(result.includes(pullRequest.url)).equal(true);
    expect(result.includes("Owner: " + pullRequest.owner.Slack_Name)).equal(false);
    expect(result.includes("Created: " + pullRequest.records.times[0])).equal(true);
    expect(result.includes("Updated: " + pullRequest.records.times[0])).equal(false);
  });

  it("should construct a queue string with only updated time", () => {
    const options: any = {
      Include_Created_Time: false,
      Include_Updated_Time: true,
    };

    const result = constructQueueString(pullRequest, options);

    expect(result.includes(pullRequest.title)).equal(true);
    expect(result.includes(pullRequest.url)).equal(true);
    expect(result.includes("Owner: " + pullRequest.owner.Slack_Name)).equal(false);
    expect(result.includes("Created: " + pullRequest.records.times[0])).equal(false);
    expect(result.includes("Updated: " + pullRequest.records.times[0])).equal(true);
  });

  it("should construct a queue string with only an owner", () => {
    const options: any = {
      Include_Created_Time: false,
      Include_Updated_Time: false,
      Include_Owner: true,
    };

    const result = constructQueueString(pullRequest, options);

    expect(result.includes(pullRequest.title)).equal(true);
    expect(result.includes(pullRequest.url)).equal(true);
    expect(result.includes("Owner: " + pullRequest.owner.Slack_Name)).equal(true);
    expect(result.includes("Created: " + pullRequest.records.times[0])).equal(false);
    expect(result.includes("Updated: " + pullRequest.records.times[0])).equal(false);
  });

  it("should construct a queue string with no datetime stamps", () => {
    const options: any = {
      Include_Created_Time: false,
      Include_Updated_Time: false,
    };

    const result = constructQueueString(pullRequest, options);

    expect(result.includes(pullRequest.title)).equal(true);
    expect(result.includes(pullRequest.url)).equal(true);
    expect(result.includes("Owner: " + pullRequest.owner.Slack_Name)).equal(false);
    expect(result.includes("Created: " + pullRequest.records.times[0])).equal(false);
    expect(result.includes("Updated: " + pullRequest.records.times[0])).equal(false);
  });

});
