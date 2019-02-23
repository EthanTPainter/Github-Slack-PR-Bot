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
      members_approving: ["EthanP"],
      lead_complete: false,
      leads_approving: ["AndrewC"],
      records: {
        events: [{
          user: {
            Slack_Name: "EthanP",
            Slack_Id: "<@54321>",
          },
          action: "APPROVED",
        }, {
          user: {
            Slack_Name: "AndrewC",
            Slack_Id: "<@444>",
          },
          action: "APPROVED",
        }],
        times: ["NOW"],
      },
    };
  });

  it("should construct a queue string with new line, owner, approval names, created, & updated times", () => {
    const options: any = {
      Queue_Include_Created_Time: true,
      Queue_Include_Updated_Time: true,
      Queue_Include_Owner: true,
      Queue_Include_New_Line: true,
      Queue_Include_Approval_Names: true,
    };

    const result = constructQueueString(pullRequest, options);

    expect(result.includes(pullRequest.title)).equal(true);
    expect(result.includes(pullRequest.url)).equal(true);
    expect(result.includes("\n\t")).equal(true);  // Expect newline & indent
    expect(result.includes(`Leads Approving: [${pullRequest.leads_approving[0]}]`)).equal(true);
    expect(result.includes(`Members Approving: [${pullRequest.members_approving[0]}]`)).equal(true);
    expect(result.includes(`Owner: ${pullRequest.owner.Slack_Name}`)).equal(true);
    expect(result.includes(`Created: ${pullRequest.records.times[0]}`)).equal(true);
    expect(result.includes(`Updated: ${pullRequest.records.times[0]}`)).equal(true);
  });

  it("should construct a queue string with new line, owner, approval names, & created time", () => {
    const options: any = {
      Queue_Include_Created_Time: true,
      Queue_Include_Updated_Time: false,
      Queue_Include_Owner: true,
      Queue_Include_New_Line: true,
      Queue_Include_Approval_Names: true,
    };

    const result = constructQueueString(pullRequest, options);

    expect(result.includes(pullRequest.title)).equal(true);
    expect(result.includes(pullRequest.url)).equal(true);
    expect(result.includes("\n\t")).equal(true);
    expect(result.includes(`Owner: ${pullRequest.owner.Slack_Name}`)).equal(true);
    expect(result.includes(`Leads Approving: [${pullRequest.leads_approving[0]}]`)).equal(true);
    expect(result.includes(`Members Approving: [${pullRequest.members_approving[0]}]`)).equal(true);
    expect(result.includes(`Created: ${pullRequest.records.times[0]}`)).equal(true);
    expect(result.includes(`Updated: ${pullRequest.records.times[0]}`)).equal(false);
  });

  it("should construct a queue string with new line, owner, approval names, & updated time", () => {
    const options: any = {
      Queue_Include_Created_Time: false,
      Queue_Include_Updated_Time: true,
      Queue_Include_Owner: true,
      Queue_Include_New_Line: true,
      Queue_Include_Approval_Names: true,
    };

    const result = constructQueueString(pullRequest, options);

    expect(result.includes(pullRequest.title)).equal(true);
    expect(result.includes(pullRequest.url)).equal(true);
    expect(result.includes("\n\t")).equal(true);
    expect(result.includes(`Owner: ${pullRequest.owner.Slack_Name}`)).equal(true);
    expect(result.includes(`Leads Approving: [${pullRequest.leads_approving[0]}]`)).equal(true);
    expect(result.includes(`Members Approving: [${pullRequest.members_approving[0]}]`)).equal(true);
    expect(result.includes(`Created: ${pullRequest.records.times[0]}`)).equal(false);
    expect(result.includes(`Updated: ${pullRequest.records.times[0]}`)).equal(true);
  });

  it("should construct a queue string with new line, owner, & approval names", () => {
    const options: any = {
      Queue_Include_Created_Time: false,
      Queue_Include_Updated_Time: false,
      Queue_Include_Owner: true,
      Queue_Include_New_Line: true,
      Queue_Include_Approval_Names: true,
    };

    const result = constructQueueString(pullRequest, options);

    expect(result.includes(pullRequest.title)).equal(true);
    expect(result.includes(pullRequest.url)).equal(true);
    expect(result.includes("\n\t")).equal(true);
    expect(result.includes(`Owner: ${pullRequest.owner.Slack_Name}`)).equal(true);
    expect(result.includes(`Leads Approving: [${pullRequest.leads_approving[0]}]`)).equal(true);
    expect(result.includes(`Members Approving: [${pullRequest.members_approving[0]}]`)).equal(true);
    expect(result.includes(`Created: ${pullRequest.records.times[0]}`)).equal(false);
    expect(result.includes(`Updated: ${pullRequest.records.times[0]}`)).equal(false);
  });

  it("should construct a queue string with new line, owner, created, & updated time", () => {
    const options: any = {
      Queue_Include_Created_Time: true,
      Queue_Include_Updated_Time: true,
      Queue_Include_Owner: true,
      Queue_Include_New_Line: true,
      Queue_Include_Approval_Names: false,
    };

    const result = constructQueueString(pullRequest, options);

    expect(result.includes(pullRequest.title)).equal(true);
    expect(result.includes(pullRequest.url)).equal(true);
    expect(result.includes("\n\t")).equal(true);
    expect(result.includes(`Owner: ${pullRequest.owner.Slack_Name}`)).equal(true);
    expect(result.includes(`Leads Approving: [${pullRequest.leads_approving[0]}]`)).equal(false);
    expect(result.includes(`Members Approving: [${pullRequest.members_approving[0]}]`)).equal(false);
    expect(result.includes(`Created: ${pullRequest.records.times[0]}`)).equal(true);
    expect(result.includes(`Updated: ${pullRequest.records.times[0]}`)).equal(true);
  });

  it("should construct a queue string with new line, owner, & created time", () => {
    const options: any = {
      Queue_Include_Created_Time: true,
      Queue_Include_Updated_Time: false,
      Queue_Include_Owner: true,
      Queue_Include_New_Line: true,
      Queue_Include_Approval_Names: false,
    };

    const result = constructQueueString(pullRequest, options);

    expect(result.includes(pullRequest.title)).equal(true);
    expect(result.includes(pullRequest.url)).equal(true);
    expect(result.includes("\n\t")).equal(true);
    expect(result.includes(`Owner: ${pullRequest.owner.Slack_Name}`)).equal(true);
    expect(result.includes(`Leads Approving: [${pullRequest.leads_approving[0]}]`)).equal(false);
    expect(result.includes(`Members Approving: [${pullRequest.members_approving[0]}]`)).equal(false);
    expect(result.includes(`Created: ${pullRequest.records.times[0]}`)).equal(true);
    expect(result.includes(`Updated: ${pullRequest.records.times[0]}`)).equal(false);
  });

  it("should construct a queue string with new line, owner, & updated time", () => {
    const options: any = {
      Queue_Include_Created_Time: false,
      Queue_Include_Updated_Time: true,
      Queue_Include_Owner: true,
      Queue_Include_New_Line: true,
      Queue_Include_Approval_Names: false,
    };

    const result = constructQueueString(pullRequest, options);

    expect(result.includes(pullRequest.title)).equal(true);
    expect(result.includes(pullRequest.url)).equal(true);
    expect(result.includes("\n\t")).equal(true);
    expect(result.includes(`Owner: ${pullRequest.owner.Slack_Name}`)).equal(true);
    expect(result.includes(`Leads Approving: [${pullRequest.leads_approving[0]}]`)).equal(false);
    expect(result.includes(`Members Approving: [${pullRequest.members_approving[0]}]`)).equal(false);
    expect(result.includes(`Created: ${pullRequest.records.times[0]}`)).equal(false);
    expect(result.includes(`Updated: ${pullRequest.records.times[0]}`)).equal(true);
  });

  it("should construct a queue string with new line, & owner", () => {
    const options: any = {
      Queue_Include_Created_Time: false,
      Queue_Include_Updated_Time: false,
      Queue_Include_Owner: true,
      Queue_Include_New_Line: true,
      Queue_Include_Approval_Names: false,
    };

    const result = constructQueueString(pullRequest, options);

    expect(result.includes(pullRequest.title)).equal(true);
    expect(result.includes(pullRequest.url)).equal(true);
    expect(result.includes("\n\t")).equal(true);
    expect(result.includes(`Owner: ${pullRequest.owner.Slack_Name}`)).equal(true);
    expect(result.includes(`Leads Approving: [${pullRequest.leads_approving[0]}]`)).equal(false);
    expect(result.includes(`Members Approving: [${pullRequest.members_approving[0]}]`)).equal(false);
    expect(result.includes(`Created: ${pullRequest.records.times[0]}`)).equal(false);
    expect(result.includes(`Updated: ${pullRequest.records.times[0]}`)).equal(false);
  });

  it("should construct a queue string with new line, approval names, created, & updated times", () => {
    const options: any = {
      Queue_Include_Created_Time: true,
      Queue_Include_Updated_Time: true,
      Queue_Include_Owner: false,
      Queue_Include_New_Line: true,
      Queue_Include_Approval_Names: true,
    };

    const result = constructQueueString(pullRequest, options);

    expect(result.includes(pullRequest.title)).equal(true);
    expect(result.includes(pullRequest.url)).equal(true);
    expect(result.includes("\n\t")).equal(true);
    expect(result.includes(`Owner: ${pullRequest.owner.Slack_Name}`)).equal(false);
    expect(result.includes(`Leads Approving: [${pullRequest.leads_approving[0]}]`)).equal(true);
    expect(result.includes(`Members Approving: [${pullRequest.members_approving[0]}]`)).equal(true);
    expect(result.includes(`Created: ${pullRequest.records.times[0]}`)).equal(true);
    expect(result.includes(`Updated: ${pullRequest.records.times[0]}`)).equal(true);
  });

  it("should construct a queue string with new line, approval names, & created time", () => {
    const options: any = {
      Queue_Include_Created_Time: true,
      Queue_Include_Updated_Time: false,
      Queue_Include_Owner: false,
      Queue_Include_New_Line: true,
      Queue_Include_Approval_Names: true,
    };

    const result = constructQueueString(pullRequest, options);

    expect(result.includes(pullRequest.title)).equal(true);
    expect(result.includes(pullRequest.url)).equal(true);
    expect(result.includes("\n\t")).equal(true);
    expect(result.includes(`Owner: ${pullRequest.owner.Slack_Name}`)).equal(false);
    expect(result.includes(`Leads Approving: [${pullRequest.leads_approving[0]}]`)).equal(true);
    expect(result.includes(`Members Approving: [${pullRequest.members_approving[0]}]`)).equal(true);
    expect(result.includes(`Created: ${pullRequest.records.times[0]}`)).equal(true);
    expect(result.includes(`Updated: ${pullRequest.records.times[0]}`)).equal(false);
  });

  it("should construct a queue string with new line, approval names, & updated time", () => {
    const options: any = {
      Queue_Include_Created_Time: false,
      Queue_Include_Updated_Time: true,
      Queue_Include_Owner: false,
      Queue_Include_New_Line: true,
      Queue_Include_Approval_Names: true,
    };

    const result = constructQueueString(pullRequest, options);

    expect(result.includes(pullRequest.title)).equal(true);
    expect(result.includes(pullRequest.url)).equal(true);
    expect(result.includes("\n\t")).equal(true);
    expect(result.includes(`Owner: ${pullRequest.owner.Slack_Name}`)).equal(false);
    expect(result.includes(`Leads Approving: [${pullRequest.leads_approving[0]}]`)).equal(true);
    expect(result.includes(`Members Approving: [${pullRequest.members_approving[0]}]`)).equal(true);
    expect(result.includes(`Created: ${pullRequest.records.times[0]}`)).equal(false);
    expect(result.includes(`Updated: ${pullRequest.records.times[0]}`)).equal(true);
  });

  it("should construct a queue string with new line, & approval names", () => {
    const options: any = {
      Queue_Include_Created_Time: false,
      Queue_Include_Updated_Time: false,
      Queue_Include_Owner: false,
      Queue_Include_New_Line: true,
      Queue_Include_Approval_Names: true,
    };

    const result = constructQueueString(pullRequest, options);

    expect(result.includes(pullRequest.title)).equal(true);
    expect(result.includes(pullRequest.url)).equal(true);
    expect(result.includes("\n\t")).equal(true);
    expect(result.includes(`Owner: ${pullRequest.owner.Slack_Name}`)).equal(false);
    expect(result.includes(`Leads Approving: [${pullRequest.leads_approving[0]}]`)).equal(true);
    expect(result.includes(`Members Approving: [${pullRequest.members_approving[0]}]`)).equal(true);
    expect(result.includes(`Created: ${pullRequest.records.times[0]}`)).equal(false);
    expect(result.includes(`Updated: ${pullRequest.records.times[0]}`)).equal(false);
  });

  it("should construct a queue string with new line, created, & updated time", () => {
    const options: any = {
      Queue_Include_Created_Time: true,
      Queue_Include_Updated_Time: true,
      Queue_Include_Owner: false,
      Queue_Include_New_Line: true,
      Queue_Include_Approval_Names: false,
    };

    const result = constructQueueString(pullRequest, options);

    expect(result.includes(pullRequest.title)).equal(true);
    expect(result.includes(pullRequest.url)).equal(true);
    expect(result.includes("\n\t")).equal(true);
    expect(result.includes(`Owner: ${pullRequest.owner.Slack_Name}`)).equal(false);
    expect(result.includes(`Leads Approving: [${pullRequest.leads_approving[0]}]`)).equal(false);
    expect(result.includes(`Members Approving: [${pullRequest.members_approving[0]}]`)).equal(false);
    expect(result.includes(`Created: ${pullRequest.records.times[0]}`)).equal(true);
    expect(result.includes(`Updated: ${pullRequest.records.times[0]}`)).equal(true);
  });

  it("should construct a queue string with new line, & created time", () => {
    const options: any = {
      Queue_Include_Created_Time: true,
      Queue_Include_Updated_Time: false,
      Queue_Include_Owner: false,
      Queue_Include_New_Line: true,
      Queue_Include_Approval_Names: false,
    };

    const result = constructQueueString(pullRequest, options);

    expect(result.includes(pullRequest.title)).equal(true);
    expect(result.includes(pullRequest.url)).equal(true);
    expect(result.includes("\n\t")).equal(true);
    expect(result.includes(`Owner: ${pullRequest.owner.Slack_Name}`)).equal(false);
    expect(result.includes(`Leads Approving: [${pullRequest.leads_approving[0]}]`)).equal(false);
    expect(result.includes(`Members Approving: [${pullRequest.members_approving[0]}]`)).equal(false);
    expect(result.includes(`Created: ${pullRequest.records.times[0]}`)).equal(true);
    expect(result.includes(`Updated: ${pullRequest.records.times[0]}`)).equal(false);
  });

  it("should construct a queue string with new line, & updated time", () => {
    const options: any = {
      Queue_Include_Created_Time: false,
      Queue_Include_Updated_Time: true,
      Queue_Include_Owner: false,
      Queue_Include_New_Line: true,
      Queue_Include_Approval_Names: false,
    };

    const result = constructQueueString(pullRequest, options);

    expect(result.includes(pullRequest.title)).equal(true);
    expect(result.includes(pullRequest.url)).equal(true);
    expect(result.includes("\n\t")).equal(true);
    expect(result.includes(`Owner: ${pullRequest.owner.Slack_Name}`)).equal(false);
    expect(result.includes(`Leads Approving: [${pullRequest.leads_approving[0]}]`)).equal(false);
    expect(result.includes(`Members Approving: [${pullRequest.members_approving[0]}]`)).equal(false);
    expect(result.includes(`Created: ${pullRequest.records.times[0]}`)).equal(false);
    expect(result.includes(`Updated: ${pullRequest.records.times[0]}`)).equal(true);
  });

  it("should construct a queue string with new line", () => {
    const options: any = {
      Queue_Include_Created_Time: false,
      Queue_Include_Updated_Time: false,
      Queue_Include_Owner: false,
      Queue_Include_New_Line: true,
      Queue_Include_Approval_Names: false,
    };

    const result = constructQueueString(pullRequest, options);

    expect(result.includes(pullRequest.title)).equal(true);
    expect(result.includes(pullRequest.url)).equal(true);
    expect(result.includes("\n\t")).equal(true);
    expect(result.includes(`Owner: ${pullRequest.owner.Slack_Name}`)).equal(false);
    expect(result.includes(`Leads Approving: [${pullRequest.leads_approving[0]}]`)).equal(false);
    expect(result.includes(`Members Approving: [${pullRequest.members_approving[0]}]`)).equal(false);
    expect(result.includes(`Created: ${pullRequest.records.times[0]}`)).equal(false);
    expect(result.includes(`Updated: ${pullRequest.records.times[0]}`)).equal(false);
  });

  it("should construct a queue string with owner, approval names, created, and updated times", () => {
    const options: any = {
      Queue_Include_Created_Time: true,
      Queue_Include_Updated_Time: true,
      Queue_Include_Owner: true,
      Queue_Include_New_Line: false,
      Queue_Include_Approval_Names: true,
    };

    const result = constructQueueString(pullRequest, options);

    expect(result.includes(pullRequest.title)).equal(true);
    expect(result.includes(pullRequest.url)).equal(true);
    expect(result.includes("\n\t")).equal(false);
    expect(result.includes(`Owner: ${pullRequest.owner.Slack_Name}`)).equal(true);
    expect(result.includes(`Leads Approving: [${pullRequest.leads_approving[0]}]`)).equal(true);
    expect(result.includes(`Members Approving: [${pullRequest.members_approving[0]}]`)).equal(true);
    expect(result.includes(`Created: ${pullRequest.records.times[0]}`)).equal(true);
    expect(result.includes(`Updated: ${pullRequest.records.times[0]}`)).equal(true);
  });

  it("should construct a queue string with owner, approval names, & created time", () => {
    const options: any = {
      Queue_Include_Created_Time: true,
      Queue_Include_Updated_Time: false,
      Queue_Include_Owner: true,
      Queue_Include_New_Line: false,
      Queue_Include_Approval_Names: true,
    };

    const result = constructQueueString(pullRequest, options);

    expect(result.includes(pullRequest.title)).equal(true);
    expect(result.includes(pullRequest.url)).equal(true);
    expect(result.includes("\n\t")).equal(false);
    expect(result.includes(`Owner: ${pullRequest.owner.Slack_Name}`)).equal(true);
    expect(result.includes(`Leads Approving: [${pullRequest.leads_approving[0]}]`)).equal(true);
    expect(result.includes(`Members Approving: [${pullRequest.members_approving[0]}]`)).equal(true);
    expect(result.includes(`Created: ${pullRequest.records.times[0]}`)).equal(true);
    expect(result.includes(`Updated: ${pullRequest.records.times[0]}`)).equal(false);
  });

  it("should construct a queue string with owner, approval names, & updated time", () => {
    const options: any = {
      Queue_Include_Created_Time: false,
      Queue_Include_Updated_Time: true,
      Queue_Include_Owner: true,
      Queue_Include_New_Line: false,
      Queue_Include_Approval_Names: true,
    };

    const result = constructQueueString(pullRequest, options);

    expect(result.includes(pullRequest.title)).equal(true);
    expect(result.includes(pullRequest.url)).equal(true);
    expect(result.includes("\n\t")).equal(false);
    expect(result.includes(`Owner: ${pullRequest.owner.Slack_Name}`)).equal(true);
    expect(result.includes(`Leads Approving: [${pullRequest.leads_approving[0]}]`)).equal(true);
    expect(result.includes(`Members Approving: [${pullRequest.members_approving[0]}]`)).equal(true);
    expect(result.includes(`Created: ${pullRequest.records.times[0]}`)).equal(false);
    expect(result.includes(`Updated: ${pullRequest.records.times[0]}`)).equal(true);
  });

  it("should construct a queue string with owner, & approval names", () => {
    const options: any = {
      Queue_Include_Created_Time: false,
      Queue_Include_Updated_Time: false,
      Queue_Include_Owner: true,
      Queue_Include_New_Line: false,
      Queue_Include_Approval_Names: true,
    };

    const result = constructQueueString(pullRequest, options);

    expect(result.includes(pullRequest.title)).equal(true);
    expect(result.includes(pullRequest.url)).equal(true);
    expect(result.includes("\n\t")).equal(false);
    expect(result.includes(`Owner: ${pullRequest.owner.Slack_Name}`)).equal(true);
    expect(result.includes(`Leads Approving: [${pullRequest.leads_approving[0]}]`)).equal(true);
    expect(result.includes(`Members Approving: [${pullRequest.members_approving[0]}]`)).equal(true);
    expect(result.includes(`Created: ${pullRequest.records.times[0]}`)).equal(false);
    expect(result.includes(`Updated: ${pullRequest.records.times[0]}`)).equal(false);
  });

  it("should construct a queue string with owner, created time, & updated time", () => {
    const options: any = {
      Queue_Include_Created_Time: true,
      Queue_Include_Updated_Time: true,
      Queue_Include_Owner: true,
      Queue_Include_New_Line: false,
      Queue_Include_Approval_Names: false,
    };

    const result = constructQueueString(pullRequest, options);

    expect(result.includes(pullRequest.title)).equal(true);
    expect(result.includes(pullRequest.url)).equal(true);
    expect(result.includes("Owner: " + pullRequest.owner.Slack_Name)).equal(true);
    expect(result.includes("Created: " + pullRequest.records.times[0])).equal(true);
    expect(result.includes("Updated: " + pullRequest.records.times[0])).equal(true);
  });

  it("should construct a queue string with owner and created time", () => {
    const options: any = {
      Queue_Include_Created_Time: true,
      Queue_Include_Updated_Time: false,
      Queue_Include_Owner: true,
      Queue_Include_New_Line: false,
      Queue_Include_Approval_Names: false,
    };

    const result = constructQueueString(pullRequest, options);

    expect(result.includes(pullRequest.title)).equal(true);
    expect(result.includes(pullRequest.url)).equal(true);
    expect(result.includes("Owner: " + pullRequest.owner.Slack_Name)).equal(true);
    expect(result.includes("Created: " + pullRequest.records.times[0])).equal(true);
    expect(result.includes("Updated: " + pullRequest.records.times[0])).equal(false);
  });

  it("should construct a queue string with owner and updated time", () => {
    const options: any = {
      Queue_Include_Created_Time: false,
      Queue_Include_Updated_Time: true,
      Queue_Include_Owner: true,
      Queue_Include_New_Line: false,
      Queue_Include_Approval_Names: false,
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
      Queue_Include_Created_Time: true,
      Queue_Include_Updated_Time: true,
      Queue_Include_Owner: false,
      Queue_Include_New_Line: false,
      Queue_Include_Approval_Names: false,
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
      Queue_Include_Created_Time: true,
      Queue_Include_Updated_Time: true,
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
      Queue_Include_Created_Time: true,
      Queue_Include_Updated_Time: false,
      Queue_Include_Owner: false,
      Queue_Include_New_Line: false,
      Queue_Include_Approval_Names: false,
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
      Queue_Include_Created_Time: false,
      Queue_Include_Updated_Time: true,
      Queue_Include_Owner: false,
      Queue_Include_New_Line: false,
      Queue_Include_Approval_Names: false,
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
      Queue_Include_Created_Time: false,
      Queue_Include_Updated_Time: false,
      Queue_Include_Owner: true,
      Queue_Include_New_Line: false,
      Queue_Include_Approval_Names: false,
    };

    const result = constructQueueString(pullRequest, options);

    expect(result.includes(pullRequest.title)).equal(true);
    expect(result.includes(pullRequest.url)).equal(true);
    expect(result.includes("Owner: " + pullRequest.owner.Slack_Name)).equal(true);
    expect(result.includes("Created: " + pullRequest.records.times[0])).equal(false);
    expect(result.includes("Updated: " + pullRequest.records.times[0])).equal(false);
  });

  it("should construct a queue string with no options", () => {
    const options: any = {
      Queue_Include_Created_Time: false,
      Queue_Include_Updated_Time: false,
      Queue_Include_Owner: false,
      Queue_Include_New_Line: false,
      Queue_Include_Approval_Names: false,
    };

    const result = constructQueueString(pullRequest, options);

    expect(result.includes(pullRequest.title)).equal(true);
    expect(result.includes(pullRequest.url)).equal(true);
    expect(result.includes("Owner: " + pullRequest.owner.Slack_Name)).equal(false);
    expect(result.includes("Created: " + pullRequest.records.times[0])).equal(false);
    expect(result.includes("Updated: " + pullRequest.records.times[0])).equal(false);
  });

  it("should construct a queue string with approval names, created, and updated times", () => {
    const options: any = {
      Queue_Include_Created_Time: true,
      Queue_Include_Updated_Time: true,
      Queue_Include_Owner: false,
      Queue_Include_New_Line: false,
      Queue_Include_Approval_Names: true,
    };

    const result = constructQueueString(pullRequest, options);

    expect(result.includes(pullRequest.title)).equal(true);
    expect(result.includes(pullRequest.url)).equal(true);
    expect(result.includes("\n\t")).equal(false);
    expect(result.includes(`Owner: ${pullRequest.owner.Slack_Name}`)).equal(false);
    expect(result.includes(`Leads Approving: [${pullRequest.leads_approving[0]}]`)).equal(true);
    expect(result.includes(`Members Approving: [${pullRequest.members_approving[0]}]`)).equal(true);
    expect(result.includes(`Created: ${pullRequest.records.times[0]}`)).equal(true);
    expect(result.includes(`Updated: ${pullRequest.records.times[0]}`)).equal(true);
  });

  it("should construct a queue string with approval names, & created time", () => {
    const options: any = {
      Queue_Include_Created_Time: true,
      Queue_Include_Updated_Time: false,
      Queue_Include_Owner: false,
      Queue_Include_New_Line: false,
      Queue_Include_Approval_Names: true,
    };

    const result = constructQueueString(pullRequest, options);

    expect(result.includes(pullRequest.title)).equal(true);
    expect(result.includes(pullRequest.url)).equal(true);
    expect(result.includes("\n\t")).equal(false);
    expect(result.includes(`Owner: ${pullRequest.owner.Slack_Name}`)).equal(false);
    expect(result.includes(`Leads Approving: [${pullRequest.leads_approving[0]}]`)).equal(true);
    expect(result.includes(`Members Approving: [${pullRequest.members_approving[0]}]`)).equal(true);
    expect(result.includes(`Created: ${pullRequest.records.times[0]}`)).equal(true);
    expect(result.includes(`Updated: ${pullRequest.records.times[0]}`)).equal(false);
  });

  it("should construct a queue string with approval names, & updated time", () => {
    const options: any = {
      Queue_Include_Created_Time: false,
      Queue_Include_Updated_Time: true,
      Queue_Include_Owner: false,
      Queue_Include_New_Line: false,
      Queue_Include_Approval_Names: true,
    };

    const result = constructQueueString(pullRequest, options);

    expect(result.includes(pullRequest.title)).equal(true);
    expect(result.includes(pullRequest.url)).equal(true);
    expect(result.includes("\n\t")).equal(false);
    expect(result.includes(`Owner: ${pullRequest.owner.Slack_Name}`)).equal(false);
    expect(result.includes(`Leads Approving: [${pullRequest.leads_approving[0]}]`)).equal(true);
    expect(result.includes(`Members Approving: [${pullRequest.members_approving[0]}]`)).equal(true);
    expect(result.includes(`Created: ${pullRequest.records.times[0]}`)).equal(false);
    expect(result.includes(`Updated: ${pullRequest.records.times[0]}`)).equal(true);
  });

  it("should construct a queue string with only approval names", () => {
    const options: any = {
      Queue_Include_Created_Time: false,
      Queue_Include_Updated_Time: false,
      Queue_Include_Owner: false,
      Queue_Include_New_Line: false,
      Queue_Include_Approval_Names: true,
    };

    const result = constructQueueString(pullRequest, options);

    expect(result.includes(pullRequest.title)).equal(true);
    expect(result.includes(pullRequest.url)).equal(true);
    expect(result.includes("\n\t")).equal(false);
    expect(result.includes(`Owner: ${pullRequest.owner.Slack_Name}`)).equal(false);
    expect(result.includes(`Leads Approving: [${pullRequest.leads_approving[0]}]`)).equal(true);
    expect(result.includes(`Members Approving: [${pullRequest.members_approving[0]}]`)).equal(true);
    expect(result.includes(`Created: ${pullRequest.records.times[0]}`)).equal(false);
    expect(result.includes(`Updated: ${pullRequest.records.times[0]}`)).equal(false);
  });
});
