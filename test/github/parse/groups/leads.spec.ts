import { expect } from "chai";
import {
  getLeadsNotApproving,
  getLeadsApproving,
  getLeadsReqChanges,
} from "../../../../src/github/parse/groups";
import { SlackUser } from "../../../../src/models";

describe("getLeadsApproving", () => {

  it("should retrieve one slack lead approving", () => {
    const slackUsersApproving = [{ Slack_Name: "andrew", Slack_Id: "<@1111>" }];
    const allSlackLeadUsers = [{ Slack_Name: "andrew", Slack_Id: "<@1111>"},
                               { Slack_Name: "dinkel", Slack_Id: "<@1112>" },
                               { Slack_Name: "mike", Slack_Id: "<@1113>" }];

    const result = getLeadsApproving(slackUsersApproving, allSlackLeadUsers);
    const expected = [{ Slack_Name: "andrew", Slack_Id: "<@1111>" }];

    expect(result).deep.equal(expected);
  });

  it("should retrieve many slack leads approving", () => {
    const slackUsersApproving = [{ Slack_Name: "andrew", Slack_Id: "<@1111>" },
                                 { Slack_Name: "dinkel", Slack_Id: "<@1112>" }];
    const allSlackLeadUsers = [{ Slack_Name: "andrew", Slack_Id: "<@1111>" },
                               { Slack_Name: "dinkel", Slack_Id: "<@1112>" },
                               { Slack_Name: "mike", Slack_Id: "<@1113>" }];

    const result = getLeadsApproving(slackUsersApproving, allSlackLeadUsers);
    const expected = [{ Slack_Name: "andrew", Slack_Id: "<@1111>" },
                      { Slack_Name: "dinkel", Slack_Id: "<@1112>" }];

    expect(result).deep.equal(expected);
  });

  it("should not retrieve any slack leads with no approvals", () => {
    const slackUsersApproving: SlackUser[] = [];
    const allSlackLeadUsers = [{ Slack_Name: "andrew", Slack_Id: "<@1111>" },
                               { Slack_Name: "dinkel", Slack_Id: "<@1112>" },
                               { Slack_Name: "mike", Slack_Id: "<@1112>" }];

    const result = getLeadsApproving(slackUsersApproving, allSlackLeadUsers);
    const expected: SlackUser[] = [];

    expect(result).deep.equal(expected);
  });

  it("should not retrieve any slack leads with member approvals", () => {
    const slackUsersApproving = [{ Slack_Name: "dillon", Slack_Id: "<@1111>" }];
    const allSlackLeadUsers = [{ Slack_Name: "andrew", Slack_Id: "<@1112>" },
                               { Slack_Name: "dinkel", Slack_Id: "<@1113>" },
                               { Slack_Name: "mike", Slack_Id: "<@1114>" }];

    const result = getLeadsApproving(slackUsersApproving, allSlackLeadUsers);
    const expected: SlackUser[] = [];

    expect(result).deep.equal(expected);
  });

  it("should retrieve slack lead with member approvals", () => {
    const slackUsersApproving = [{ Slack_Name: "andrew", Slack_Id: "<@1111>" },
                                 { Slack_Name: "ethan", Slack_Id: "<@1112>" },
                                 { Slack_Name: "dillon", Slack_Id: "<@1113>" }];
    const allSlackLeadUsers = [{ Slack_Name: "andrew", Slack_Id: "<@1111>" },
                               { Slack_Name: "dinkel", Slack_Id: "<@1114>" },
                               { Slack_Name: "mike", Slack_Id: "<@1115>" }];

    const result = getLeadsApproving(slackUsersApproving, allSlackLeadUsers);
    const expected = [{ Slack_Name: "andrew", Slack_Id: "<@1111>" }];

    expect(result).deep.equal(expected);
  });
});

describe("getLeadsReqChanges", () => {

  it("should get one lead requesting changes", () => {
    const slackUsersRequestingChanges = [{ Slack_Name: "andrew", Slack_Id: "<@1111>" }];
    const allSlackLeadUsers = [{ Slack_Name: "andrew", Slack_Id: "<@1111>" },
                               { Slack_Name: "dinkel", Slack_Id: "<@1112>" },
                               { Slack_Name: "mike", Slack_Id: "<@1113>" }];

    const result = getLeadsReqChanges(slackUsersRequestingChanges,
                                    allSlackLeadUsers);
    const expected = [{ Slack_Name: "andrew", Slack_Id: "<@1111>" }];

    expect(result).deep.equal(expected);
  });

  it("should get two lead requesting changes", () => {
    const slackUsersRequestingChanges = [{ Slack_Name: "andrew", Slack_Id: "<@1111>" },
                                         { Slack_Name: "dinkel", Slack_Id: "<@1112>" }];
    const allSlackLeadUsers = [{ Slack_Name: "andrew", Slack_Id: "<@1111>" },
                               { Slack_Name: "dinkel", Slack_Id: "<@1112>" },
                               { Slack_Name: "mike", Slack_Id: "<@1113>" }];

    const result = getLeadsReqChanges(slackUsersRequestingChanges,
                                    allSlackLeadUsers);
    const expected = [{ Slack_Name: "andrew", Slack_Id: "<@1111>" },
                      { Slack_Name: "dinkel", Slack_Id: "<@1112>" }];

    expect(result).deep.equal(expected);
  });

  it("should not get any lead requesting changes", () => {
    const slackUsersRequestingChanges: SlackUser[] = [];
    const allSlackLeadUsers = [{ Slack_Name: "andrew", Slack_Id: "<@1111>" },
                               { Slack_Name: "dinkel", Slack_Id: "<@1112>" },
                               { Slack_Name: "mike", Slack_Id: "<@1113>" }];

    const result = getLeadsReqChanges(slackUsersRequestingChanges,
                                    allSlackLeadUsers);
    const expected: SlackUser[] = [];

    expect(result).deep.equal(expected);
  });

  it("should get lead requesting changes with other slack users", () => {
    const slackUsersRequestingChanges = [{ Slack_Name: "ethan", Slack_Id: "<@1111>" },
                                         { Slack_Name: "andrew", Slack_Id: "<@1112>" },
                                         { Slack_Name: "dillon", Slack_Id: "<@1113>" }];
    const allSlackLeadUsers = [{ Slack_Name: "andrew", Slack_Id: "<@1112>" },
                               { Slack_Name: "dinkel", Slack_Id: "<@1114>" },
                               { Slack_Name: "mike", Slack_Id: "<@1115>" }];

    const result = getLeadsReqChanges(slackUsersRequestingChanges,
                                    allSlackLeadUsers);
    const expected = [{ Slack_Name: "andrew", Slack_Id: "<@1112>" }];

    expect(result).deep.equal(expected);
  });

  it("should get leads requesting changes with other slack users", () => {
    const slackUsersRequestingChanges = [{ Slack_Name: "ethan", Slack_Id: "<@1111>" },
                                         { Slack_Name: "mike", Slack_Id: "<@1112>" },
                                         { Slack_Name: "dinkel", Slack_Id: "<@1113>" }];
    const allSlackLeadUsers = [{ Slack_Name: "andrew", Slack_Id: "<@1114>" },
                               { Slack_Name: "dinkel", Slack_Id: "<@1113>" },
                               { Slack_Name: "mike", Slack_Id: "<@1112>" }];

    const result = getLeadsReqChanges(slackUsersRequestingChanges,
                                    allSlackLeadUsers);
    const expected = [{ Slack_Name: "mike", Slack_Id: "<@1112>" },
                      { Slack_Name: "dinkel", Slack_Id: "<@1113>" }];

    expect(result).deep.equal(expected);
  });

});

describe("getLeadsNotApproving", () => {
  it("should retrieve slack lead not approving", () => {
    const slackUsersNotApproving = [{ Slack_Name: "andrew", Slack_Id: "<@1111>" },
                                    { Slack_Name: "dillon", Slack_Id: "<@1112>" },
                                    { Slack_Name: "daniel", Slack_Id: "<@1113>" }];
    const allSlackLeadUsers = [{ Slack_Name: "andrew", Slack_Id: "<@1111>" }];

    const result = getLeadsNotApproving(slackUsersNotApproving, allSlackLeadUsers);
    const expected = [{ Slack_Name: "andrew", Slack_Id: "<@1111>" }];

    expect(result).deep.equal(expected);
  });

  it("should not retrieve any slack leads", () => {
    const slackUsersNotApproving = [{ Slack_Name: "andrew", Slack_Id: "<@1111>" },
                                    { Slack_Name: "dillon", Slack_Id: "<@1112>" },
                                    { Slack_Name: "daniel", Slack_Id: "<@1113>" }];
    const allSlackLeadUsers = [{ Slack_Name: "dinkel", Slack_Id: "<@1114>" }];

    const result = getLeadsNotApproving(slackUsersNotApproving, allSlackLeadUsers);
    const expected: SlackUser[] = [];

    expect(result).deep.equal(expected);
  });

  it("should not retrieve all slack users not approving", () => {
    const slackUsersNotApproving = [{ Slack_Name: "andrew", Slack_Id: "<@1111>" },
                                    { Slack_Name: "dinkel", Slack_Id: "<@1112>" },
                                    { Slack_Name: "marwan", Slack_Id: "<@1113>" }];
    const allSlackLeadUsers = [{ Slack_Name: "andrew", Slack_Id: "<@1111>" },
                               { Slack_Name: "dinkel", Slack_Id: "<@1112>" },
                               { Slack_Name: "marwan", Slack_Id: "<@1113>" }];

    const result = getLeadsNotApproving(slackUsersNotApproving, allSlackLeadUsers);
    const expected = allSlackLeadUsers;

    expect(result).deep.equal(expected);
  });
});
