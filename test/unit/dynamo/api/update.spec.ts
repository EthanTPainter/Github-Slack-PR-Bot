import * as sinon from "sinon";
import { expect } from "chai";
import { DynamoUpdate } from "../../../../src/dynamo/api";
import { SlackUser } from "../../../../src/models";
import { requiredEnvs } from "src/required-envs";

describe("updatePullRequest", () => {

  it("should update PR with one PR in queue", async () => {
    const dynamo = new DynamoUpdate();
    const slackUser: SlackUser = { Slack_Name: "ethan", Slack_Id: "<@1111>" };
    const currentQueue: any = [{
      owner: { Slack_Name: "ethan", Slack_Id: "<@1111>"},
      title: "New title",
      url: "my url",
      member_complete: false,
      members_approving: [],
      lead_complete: false,
      leads_approving: [],
      events: [{
        user: {Slack_Name: "Ethan", Slack_Id: "<@1111>"},
        action: "OPENED",
        time: "NOW",
      }],
    }];
    const updatedPR: any = {
      owner: {Slack_Name: "ethan", Slack_Id: "<@1111>"},
      title: "New title",
      url: "my url",
      member_complete: false,
      members_approving: [],
      lead_complete: false,
      leads_approving: [],
      events: [{
        user: {Slack_Name: "Ethan", Slack_Id: "<@1111>"},
        action: "OPENED",
        time: "NOW",
      }, {
        user: {Slack_Name: "Andrew", Slack_Id: "<@2222>"},
        action: "APPROVED",
        time: "NEW NOW",
      }],
    };

    sinon.stub(dynamo, "updatePullRequest")
      .resolves(updatedPR);

    const result = await dynamo.updatePullRequest(
      requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
      slackUser.Slack_Id,
      currentQueue,
      updatedPR);

    expect(result).equal(updatedPR);
  });

});
