import * as AWS from "aws-sdk";
import { expect } from "chai";
import { DynamoUpdate } from "../../../src/dynamo/api";

describe("putItem", () => {

  it("should put an item into the dynamoDB table", async () => {
    const dynamo = new DynamoUpdate();
    const githubUser = "testUser";
    const data = "NEW DATA";

    const dynamoDB = new AWS.DynamoDB.DocumentClient({
      apiVersion: "2012-08-10",
      region: "us-east-1",
    });

    // const result = await dynamo.updateItem(githubUser, data);
    // console.log(result);
  });

});
