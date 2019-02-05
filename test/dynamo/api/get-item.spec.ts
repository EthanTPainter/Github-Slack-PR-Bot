import { expect } from "chai";
import * as AWS from "aws-sdk";
import { DynamoGet } from "../../../src/dynamo/api";
import * as sinon from "sinon";

describe("getItem", () => {

  const sandbox = sinon.createSandbox();

  afterEach(() => {
    sandbox.restore();
  });

  it("successful get an item from DynamoDB table", async () => {
    const dynamo = new DynamoGet();
    const githubUser = "testUser";

    const expected = {
      Item: {
        githubUser: "testUser",
      },
    };

    // Stub out DocumentClient.get
    const dynamoDB = new AWS.DynamoDB.DocumentClient({
      apiVersion: "2012-08-10",
      region: "us-east-1",
    });
    // dynamoDB.get = sandbox.stub(dynamoDB, "get")
    //                     .resolves(expected);
    // const result = await dynamo.getItem(githubUser);
    // console.log(result);
  });

});
