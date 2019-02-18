import * as AWS from "aws-sdk";
import { Item } from "../../../src/models";
import { expect } from "chai";
import { DynamoAppend } from "../../../src/dynamo/api";

describe("putItem", () => {

  it("should put an item into the dynamoDB table", async () => {
    const dynamo = new DynamoAppend();
    const slackUser = { Slack_Name: "testUser", Slack_Id: "<@12345>" };
    const data: Item = {
      owner: { Slack_Name: "ethan", Slack_Id: "<@1111>" },
      title: "New title",
      url: "my url",
      peerComplete: false,
      peersApproving: [],
      leadComplete: false,
      leadsApproving: [],
    };

    const dynamoDB = new AWS.DynamoDB.DocumentClient({
      apiVersion: "2012-08-10",
      region: "us-east-1",
    });

    // const result = await dynamo.appendItem(slackUser, [], data);
    // console.log(result);
  });

});
