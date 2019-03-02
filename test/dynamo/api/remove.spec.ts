import { expect } from "chai";
import * as sinon from "sinon";
import { DynamoRemove } from "../../../src/dynamo/api";

describe("removePullRequest", () => {

  it("should remove PullRequest from the queue in the DynamoDB table", () => {
    const dynamo = new DynamoRemove();
    const slackUser = {};
    const currentContents = [{
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
    const removingPullRequest = {
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
    };

  });

});
