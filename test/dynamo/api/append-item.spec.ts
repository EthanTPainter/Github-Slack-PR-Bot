import { DynamoAppend } from "../../../src/dynamo/api";
import { Item } from "../../../src/models";
import { expect } from "chai";
import * as sinon from "sinon";

describe("putItem", () => {

  it("should append an item onto an empty queue in the dynamoDB table", async () => {
    const dynamo = new DynamoAppend();
    const slackUser = { Slack_Name: "testUser", Slack_Id: "<@12345>" };

    const data: any = [{
      owner: { Slack_Name: "ethan", Slack_Id: "<@1111>" },
      title: "New title",
      url: "my url",
      member_complete: false,
      members_approving: [],
      lead_complete: false,
      leads_approving: [],
      records: {
        events: [{
          user: {
            Slack_Name: "Ethan",
            Slack_Id: "<@1111>",
          },
          action: "APPROVED",
        }],
        times: ["NOW"],
      },
    }];

    sinon.stub(dynamo, "appendItem")
      .resolves(data);

    // Given empty current contents, append new data to array
    const result = await dynamo.appendItem(slackUser, [], data[0]);

    expect(result).to.be.equal(data);
  });

  it("should append an item on a queue with one existing item in the dynamoDB table", () => {
    const dynamo = new DynamoAppend();
    const slackUser = { Slack_Name: "SlackUser", Slack_Id: "<@3333>" };

    const existingData: any = [{
      owner: { Slack_Name: "ethan", Slack_Id: "<@1111>" },
      title: "New title",
      url: "my url",
      member_complete: false,
      members_approving: [],
      lead_complete: false,
      leads_approving: [],
      records: {
        events: [{
          user: {
            Slack_Name: "Ethan",
            Slack_Id: "<@1111>",
          },
          action: "APPROVED",
        }],
        times: ["NOW"],
      },
    }];

    const newData: any = {
      owner: { Slack_Name: "daniel", Slack_Id: "<@2222>" },
      title: "Another new title",
      url: "www.github.com",
      member_complete: false,
      members_approving: [],
      lead_complete: false,
      leads_approving: [],
      records: {
        events: [{
          user: {
            Slack_Name: "Ethan",
            Slack_Id: "<@1111>",
          },
          action: "APPROVED",
        }],
        times: ["NOW"],
      },
    };
  });

});
