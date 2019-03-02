import { DynamoAppend } from "../../../src/dynamo/api";
import { PullRequest } from "../../../src/models";
import { expect } from "chai";
import * as sinon from "sinon";

describe("putPullRequest", () => {

  it("should append an PullRequest onto an empty queue in the dynamoDB table", async () => {
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
          time: "NOW",
        }],
      },
    }];

    sinon.stub(dynamo, "appendPullRequest")
      .resolves(data);

    // Given empty current contents, append new data to array
    const result = await dynamo.appendPullRequest(slackUser.Slack_Id, [], data[0]);

    expect(result).to.be.equal(data);
  });

  it("should append an PullRequest on a queue with one existing PullRequest in the dynamoDB table", () => {
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
      events: [{
        user: {
          Slack_Name: "Ethan",
          Slack_Id: "<@1111>",
        },
        action: "APPROVED",
        time: "NEW TIME",
      }],
    }];

    const newData: any = {
      owner: { Slack_Name: "daniel", Slack_Id: "<@2222>" },
      title: "Another new title",
      url: "www.github.com",
      member_complete: false,
      members_approving: [],
      lead_complete: false,
      leads_approving: [],
      events: [{
        user: {
          Slack_Name: "Ethan",
          Slack_Id: "<@1111>",
        },
        action: "APPROVED",
        time: "NEW TIME",
      }],
    };
  });

});
