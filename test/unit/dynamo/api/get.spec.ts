import { expect } from "chai";
import * as sinon from "sinon";

import { DynamoGet } from "../../../../src/dynamo/api";
import { PullRequest } from "../../../../src/models";
import { requiredEnvs } from "../../../../src/required-envs";

describe("getPullRequest", () => {

  it("should successfully get a queue with one PR", async () => {
    const dynamo = new DynamoGet();
    const slackUser = { Slack_Name: "testUser", Slack_Id: "testUser" };

    const expected: PullRequest[] = [{
      owner: {
        Slack_Name: "ethan.painter",
        Slack_Id: "<@12345>",
      },
      title: "feat(1234): New feature",
      url: "www.github.com/ethantpainter",
      comment_times: {},
      standard_members_alert: ["<@UUID123>", "<UUID567>"],
      standard_leads_alert: [],
      member_complete: false,
      members_approving: [],
      lead_complete: false,
      leads_approving: [],
      leads_req_changes: [],
      members_req_changes: [],
      req_changes_leads_alert: [],
      req_changes_members_alert: [],
      events: [{
        user: {
          Slack_Name: "DillonX",
          Slack_Id: "<@54321>",
        },
        action: "APPROVED",
        time: "NOW",
      }],
    }];

    sinon.stub(dynamo, "getQueue")
      .resolves(expected);

    const result = await dynamo.getQueue(
      requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
      slackUser.Slack_Id);

    expect(result).deep.equal(expected);
  });

});
