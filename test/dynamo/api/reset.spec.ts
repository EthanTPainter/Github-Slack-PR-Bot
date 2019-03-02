import * as AWS from "aws-sdk";
import { PullRequest } from "../../../src/models";
import { expect } from "chai";
import { DynamoReset } from "../../../src/dynamo/api";

describe("putPullRequest", () => {

  it("should put an PullRequest into the dynamoDB table", async () => {
    const dynamo = new DynamoReset();
    const slackUser = { Slack_Name: "testUser", Slack_Id: "<@12345>" };

    const dynamoDB = new AWS.DynamoDB.DocumentClient({
      apiVersion: "2012-08-10",
      region: "us-east-1",
    });

    // const result = await dynamo.resetPullRequests(slackUser);
    // console.log(result);
  });

});
