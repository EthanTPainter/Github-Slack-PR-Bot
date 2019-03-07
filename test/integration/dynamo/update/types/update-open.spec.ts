import { json } from "../../../json";
import { requiredEnvs } from "../../../../../src/required-envs";
import {
  DynamoAppend,
  DynamoGet,
  DynamoReset,
} from "../../../../../src/dynamo/api";
import { getTeamName } from "src/json/parse";

describe("Dynamo.UpdateOpen", () => {

  const dynamoGet = new DynamoGet();
  const dynamoAppend = new DynamoAppend();
  const dynamoReset = new DynamoReset();

  const slackLead1 = json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead1;
  const slackLead2 = json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead2;
  const slackLead3 = json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead3;
  const slackMember1 = json.Departments.Devs.DevTeam1.Users.Members.GitHubMember1;
  const slackMember2 = json.Departments.Devs.DevTeam1.Users.Members.GitHubMember2;
  const slackMember3 = json.Departments.Devs.DevTeam1.Users.Leads.GitHubLead3;

  // Reset queue for all slack users before each test
  beforeEach(async () => {
    await dynamoReset.resetQueue(requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME, slackLead1.Slack_Id);
    await dynamoReset.resetQueue(requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME, slackLead2.Slack_Id);
    await dynamoReset.resetQueue(requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME, slackLead3.Slack_Id);
    await dynamoReset.resetQueue(requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME, slackMember1.Slack_Id);
    await dynamoReset.resetQueue(requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME, slackMember2.Slack_Id);
    await dynamoReset.resetQueue(requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME, slackMember3.Slack_Id);
  });

  // Reset each queue after all tests complete
  after(async () => {
    await dynamoReset.resetQueue(requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME, slackLead1.Slack_Id);
    await dynamoReset.resetQueue(requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME, slackLead2.Slack_Id);
    await dynamoReset.resetQueue(requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME, slackLead3.Slack_Id);
    await dynamoReset.resetQueue(requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME, slackMember1.Slack_Id);
    await dynamoReset.resetQueue(requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME, slackMember2.Slack_Id);
    await dynamoReset.resetQueue(requiredEnvs.INTEGRATION_TEST_DYNAMO_TABLE_NAME, slackMember3.Slack_Id);
  });

  it("should update a queue with an opened PR -- owned by a member", () => {
    const event = {
      pull_request: {
        title: "NEW PR TITLE",
        html_url: "www.github.com/ethantpainter",
      },
    };
  });

});
