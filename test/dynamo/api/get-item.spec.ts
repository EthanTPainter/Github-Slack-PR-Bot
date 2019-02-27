import { expect } from "chai";
import * as sinon from "sinon";

import { DynamoGet } from "../../../src/dynamo/api";
import { Item } from "../../../src/models";

describe("getItem", () => {

  it("should successfully get an item from a DynamoDB table", async () => {
    const dynamo = new DynamoGet();
    const slackUser = { Slack_Name: "testUser", Slack_Id: "testUser" };

    const expected: Item[] = [{
      owner: {
        Slack_Name: "ethan.painter",
        Slack_Id: "<@12345>",
      },
      title: "feat(1234): New feature",
      url: "www.github.com/ethantpainter",
      associated_user_ids: ["<@UUID123>", "<UUID567>"],
      member_complete: false,
      members_approving: [],
      lead_complete: false,
      leads_approving: [],
      records: {
        events: [{
          user: {
            Slack_Name: "DillonX",
            Slack_Id: "<@54321>",
          },
          action: "APPROVED",
        }],
        times: ["NOW"],
      },
    }];

    sinon.stub(dynamo, "getItem")
      .resolves(expected);

    const result = await dynamo.getItem(slackUser);

    expect(result).deep.equal(expected);
  });

});
