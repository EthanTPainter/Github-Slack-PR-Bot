import { DynamoAppend } from "../../../../src/dynamo/api";
import { expect } from "chai";
import * as sinon from "sinon";
import { requiredEnvs } from "../../../../src/required-envs";

describe("appendPullRequest", () => {

  it("should append a PR onto an empty queue", async () => {
    const dynamo = new DynamoAppend();
    const slackUser = { Slack_Name: "testUser", Slack_Id: "<@12345>" };

    const data: any = {
      owner: {
        Slack_Name: "ethan",
        Slack_Id: "<@1111>",
      },
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
    };

    sinon.stub(dynamo, "appendPullRequest")
      .resolves(data);

    // Given empty current contents, append new data to array
    const result = await dynamo.appendPullRequest(
      requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
      slackUser.Slack_Id, [], data);

    expect(result).equal(data);
  });

  it("should append a PR on a queue with one existing PR in the queue", async () => {
    const dynamo = new DynamoAppend();
    const slackUser = { Slack_Name: "SlackUser", Slack_Id: "<@3333>" };

    const existingData: any = [{
      owner: { Slack_Name: "ethan", Slack_Id: "<@1111>" },
      title: "New title",
      url: "my url",
      standard_members_alert: [],
      member_complete: false,
      members_approving: [],
      standard_leads_alert: [],
      lead_complete: false,
      leads_approving: [],
      events: [{
        user: {
          Slack_Name: "Ethan",
          Slack_Id: "<@1111>",
        },
        action: "OPENED",
        time: "FIRST TIME",
      }],
    }];

    const newData: any = {
      owner: { Slack_Name: "daniel", Slack_Id: "<@2222>" },
      title: "Another new title",
      url: "www.github.com",
      standard_members_alert: [],
      member_complete: false,
      members_approving: [],
      standard_leads_alert: [],
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

    const expected = existingData;
    expected.push(newData);

    sinon.stub(dynamo, "appendPullRequest")
      .resolves(expected);

    const result = await dynamo.appendPullRequest(
      requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
      slackUser.Slack_Id,
      existingData,
      newData);

    expect(result).equal(expected);
  });

});
