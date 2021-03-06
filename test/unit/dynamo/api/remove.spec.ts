import { expect } from "chai";
import * as sinon from "sinon";
import { DynamoRemove } from "../../../../src/dynamo/api";
import { requiredEnvs } from "../../../../src/required-envs";

describe("removePullRequest", () => {

  it("should remove PullRequest from the queue in the DynamoDB table", async () => {
    const dynamo = new DynamoRemove();
    const slackUser = { Slack_Name: "ethan", Slack_Id: "<@1111>" };
    const currentQueue = [{
      owner: { Slack_Name: "ethan", Slack_Id: "<@1111>" },
      title: "New title",
      url: "my url",
      comment_times: {},
      standard_members_alert: [],
      member_complete: false,
      members_approving: [],
      standard_leads_alert: [],
      lead_complete: false,
      leads_approving: [],
      leads_req_changes: [],
      members_req_changes: [],
      req_changes_leads_alert: [],
      req_changes_members_alert: [],
      events: [{
        user: {
          Slack_Name: "Ethan",
          Slack_Id: "<@1111>",
        },
        action: "APPROVED",
        time: "NOW",
      }],
    }];
    const removingPullRequest = {
      owner: { Slack_Name: "ethan", Slack_Id: "<@1111>" },
      title: "New title",
      url: "my url",
      comment_times: {},
      standard_members_alert: [],
      member_complete: false,
      members_approving: [],
      standard_leads_alert: [],
      lead_complete: false,
      leads_approving: [],
      leads_req_changes: [],
      members_req_changes: [],
      req_changes_leads_alert: [],
      req_changes_members_alert: [],
      events: [{
        user: {
          Slack_Name: "Ethan",
          Slack_Id: "<@1111>",
        },
        action: "APPROVED",
        time: "NEW",
      }],
    };

    const expected: any = [];

    sinon.stub(dynamo, "removePullRequest")
      .resolves(expected);

    const result = await dynamo.removePullRequest(
      requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
      slackUser,
      currentQueue,
      removingPullRequest);

    expect(result).deep.equal(expected);
  });

});
