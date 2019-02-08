import * as AWS from "aws-sdk";
import { Item } from "../../../src/models";
import { expect } from "chai";
import { DynamoReset } from "../../../src/dynamo/api";

describe("putItem", () => {

  it("should put an item into the dynamoDB table", async () => {
    const dynamo = new DynamoReset();
    const slackUser = "testUser";

    const dynamoDB = new AWS.DynamoDB.DocumentClient({
      apiVersion: "2012-08-10",
      region: "us-east-1",
    });

    // const result = await dynamo.resetItems(slackUser);
    // console.log(result);
  });

});
