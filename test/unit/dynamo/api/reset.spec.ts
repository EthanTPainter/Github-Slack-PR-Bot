import * as sinon from "sinon";
import { expect } from "chai";
import { DynamoReset } from "../../../../src/dynamo/api";
import { requiredEnvs } from "../../../../src/required-envs";

describe("putPullRequest", () => {

  it("should reset a queue to empty array givne slack user id", async () => {
    const dynamo = new DynamoReset();
    const slackUser = { Slack_Name: "testUser", Slack_Id: "<@12345>" };

    const expected: any = [];
    sinon.stub(dynamo, "resetQueue")
      .resolves(expected);

    const result = await dynamo.resetQueue(
      requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME,
      slackUser);

    expect(result).equal(expected);
  });

});
