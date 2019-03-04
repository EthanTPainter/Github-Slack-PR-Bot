import { expect } from "chai";
import * as sinon from "sinon";

import { DynamoGet } from "../../../../src/dynamo/api";
import { PullRequest } from "../../../../src/models";

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
      members_alert: ["<@UUID123>", "<UUID567>"],
      leads_alert: [],
      member_complete: false,
      members_approving: [],
      lead_complete: false,
      leads_approving: [],
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

    const result = await dynamo.getQueue(slackUser.Slack_Id);

    expect(result).deep.equal(expected);
  });

});
