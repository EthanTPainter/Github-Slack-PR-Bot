import { expect } from "chai";
import {
  getMembersApproving,
  getMembersReqChanges,
  getMembersNotApproving,
} from "../../../../src/github/parse/groups/members";
import { SlackUser } from "src/models";

describe("getMembersApproving", () => {

  it("should get a member approving", () => {
    const slackUsersApproving = [{ Slack_Name: "ethan", Slack_Id: "<@1111>" }];
    const allSlackLeadUsers = [{ Slack_Name: "ethan", Slack_Id: "<@1111>" },
                               { Slack_Name: "daniel", Slack_Id: "<@1112>" },
                               { Slack_Name: "harrison", Slack_Id: "<@1113>" },
                               { Slack_Name: "ben", Slack_Id: "<@1114>" }];

    const result = getMembersApproving(slackUsersApproving,
                                    allSlackLeadUsers);
    const expected = [{ Slack_Name: "ethan", Slack_Id: "<@1111>" }];

    expect(result).to.be.deep.equal(expected);
  });

  it("should get many members approving", () => {
    const slackUsersApproving = [{ Slack_Name: "ethan", Slack_Id: "<@1111>" },
                                 { Slack_Name: "daniel", Slack_Id: "<@1112>" }];
    const allSlackLeadUsers = [{ Slack_Name: "ethan", Slack_Id: "<@1111>" },
                               { Slack_Name: "daniel", Slack_Id: "<@1112>" },
                               { Slack_Name: "harrison", Slack_Id: "<@1113>" },
                               { Slack_Name: "ben", Slack_Id: "<@1114>" }];

    const result = getMembersApproving(slackUsersApproving,
                                    allSlackLeadUsers);
    const expected = [{ Slack_Name: "ethan", Slack_Id: "<@1111>" },
                      { Slack_Name: "daniel", Slack_Id: "<@1112>" }];

    expect(result).to.be.deep.equal(expected);
  });

  it("should get a member with other users approving", () => {
    const slackUsersApproving = [{ Slack_Name: "ethan", Slack_Id: "<@1111>" },
                                 { Slack_Name: "andrew", Slack_Id: "<@1112>" },
                                 { Slack_Name: "mike", Slack_Id: "<@1113>" }];
    const allSlackLeadUsers = [{ Slack_Name: "ethan", Slack_Id: "<@1111>" },
                               { Slack_Name: "daniel", Slack_Id: "<@1114>" },
                               { Slack_Name: "harrison", Slack_Id: "<@1115>" },
                               { Slack_Name: "ben", Slack_Id: "<@1116>" }];

    const result = getMembersApproving(slackUsersApproving,
                                    allSlackLeadUsers);
    const expected = [{ Slack_Name: "ethan", Slack_Id: "<@1111>" }];

    expect(result).to.be.deep.equal(expected);
  });

  it("should not get any members approving", () => {
    const slackUsersApproving: SlackUser[] = [];
    const allSlackLeadUsers = [{ Slack_Name: "ethan", Slack_Id: "<@1111>" },
                               { Slack_Name: "daniel", Slack_Id: "<@1111>" },
                               { Slack_Name: "harrison", Slack_Id: "<@1111>" },
                               { Slack_Name: "ben", Slack_Id: "<@1111>" }];

    const result = getMembersApproving(slackUsersApproving,
                                    allSlackLeadUsers);
    const expected: SlackUser[] = [];

    expect(result).to.be.deep.equal(expected);
  });

  it("should not get any members approving with leads approving", () => {
    const slackUsersApproving = [{ Slack_Name: "andrew", Slack_Id: "<@1111>" }];
    const allSlackLeadUsers = [{ Slack_Name: "ethan", Slack_Id: "<@1112>" },
                               { Slack_Name: "daniel", Slack_Id: "<@1113>" },
                               { Slack_Name: "harrison", Slack_Id: "<@1114>" },
                               { Slack_Name: "ben", Slack_Id: "<@1115>" }];

    const result = getMembersApproving(slackUsersApproving,
                                    allSlackLeadUsers);
    const expected: SlackUser[] = [];

    expect(result).to.be.deep.equal(expected);
  });

});

describe("getMembersReqChanges", () => {

  it("should get a member requesting changes", () => {
    const slackUsersReqChanges = [{ Slack_Name: "ethan", Slack_Id: "<@1111>" }];
    const allSlackLeadUsers = [{ Slack_Name: "ethan", Slack_Id: "<@1111>" },
                               { Slack_Name: "daniel", Slack_Id: "<@1112>" },
                               { Slack_Name: "harrison", Slack_Id: "<@1113>" },
                               { Slack_Name: "ben", Slack_Id: "<@1114>" }];

    const result = getMembersApproving(slackUsersReqChanges,
                                    allSlackLeadUsers);
    const expected = [{ Slack_Name: "ethan", Slack_Id: "<@1111>" }];

    expect(result).to.be.deep.equal(expected);
  });

  it("should get many members requesting changes", () => {
    const slackUsersReqChanges = [{ Slack_Name: "ethan", Slack_Id: "<@1111>" },
                                  { Slack_Name: "harrison", Slack_Id: "<@1112>" }];
    const allSlackLeadUsers = [{ Slack_Name: "ethan", Slack_Id: "<@1111>" },
                               { Slack_Name: "daniel", Slack_Id: "<@1113>" },
                               { Slack_Name: "harrison", Slack_Id: "<@1112>" },
                               { Slack_Name: "ben", Slack_Id: "<@1114>" }];

    const result = getMembersApproving(slackUsersReqChanges,
                                    allSlackLeadUsers);
    const expected = [{ Slack_Name: "ethan", Slack_Id: "<@1111>" },
                      { Slack_Name: "harrison", Slack_Id: "<@1112>" }];

    expect(result).to.be.deep.equal(expected);
  });

  it("should get a member requesting changes with other users", () => {
    const slackUsersReqChanges = [{ Slack_Name: "ethan", Slack_Id: "<@1111>" },
                                  { Slack_Name: "dinkel", Slack_Id: "<@1112>" }];
    const allSlackLeadUsers = [{ Slack_Name: "ethan", Slack_Id: "<@1111>" },
                               { Slack_Name: "daniel", Slack_Id: "<@1115>" },
                               { Slack_Name: "harrison", Slack_Id: "<@1113>" },
                               { Slack_Name: "ben", Slack_Id: "<@1114>" }];

    const result = getMembersApproving(slackUsersReqChanges,
                                    allSlackLeadUsers);
    const expected = [{ Slack_Name: "ethan", Slack_Id: "<@1111>" }];

    expect(result).to.be.deep.equal(expected);
  });

  it("should get many members requesting changes with other users", () => {
    const slackUsersReqChanges = [{ Slack_Name: "ethan", Slack_Id: "<@1111>" },
                                  { Slack_Name: "harrison", Slack_Id: "<@1112>" },
                                  { Slack_Name: "dinkel", Slack_Id: "<@1113>" },
                                  { Slack_Name: "andrew", Slack_Id: "<@1114>" }];
    const allSlackLeadUsers = [{ Slack_Name: "ethan", Slack_Id: "<@1111>" },
                               { Slack_Name: "daniel", Slack_Id: "<@1115>" },
                               { Slack_Name: "harrison", Slack_Id: "<@1112>" },
                               { Slack_Name: "ben", Slack_Id: "<@1116>" }];

    const result = getMembersApproving(slackUsersReqChanges,
                                    allSlackLeadUsers);
    const expected = [{ Slack_Name: "ethan", Slack_Id: "<@1111>" },
                      { Slack_Name: "harrison", Slack_Id: "<@1112>" }];

    expect(result).to.be.deep.equal(expected);
  });

  it("should not get any members requesting changes", () => {
    const slackUsersReqChanges: SlackUser[] = [];
    const allSlackLeadUsers = [{ Slack_Name: "ethan", Slack_Id: "<@1111>" },
                               { Slack_Name: "daniel", Slack_Id: "<@1112>" },
                               { Slack_Name: "harrison", Slack_Id: "<@1113>" },
                               { Slack_Name: "ben", Slack_Id: "<@1114>" }];

    const result = getMembersApproving(slackUsersReqChanges,
                                    allSlackLeadUsers);
    const expected: SlackUser[] = [];

    expect(result).to.be.deep.equal(expected);
  });

  it("should not get any members requesting changes with other users", () => {
    const slackUsersReqChanges = [{ Slack_Name: "andrew", Slack_Id: "<@1111>" },
                                  { Slack_Name: "dinkel", Slack_Id: "<@1112>" }];
    const allSlackLeadUsers = [{ Slack_Name: "ethan", Slack_Id: "<@1113>" },
                               { Slack_Name: "daniel", Slack_Id: "<@1114>" },
                               { Slack_Name: "harrison", Slack_Id: "<@1115>" },
                               { Slack_Name: "ben", Slack_Id: "<@1116>" }];

    const result = getMembersApproving(slackUsersReqChanges,
                                    allSlackLeadUsers);
    const expected: SlackUser[] = [];

    expect(result).to.be.deep.equal(expected);
  });

});

describe("getMembersNotApproving", () => {
  it("should retrieve a member not approving", () => {
    const slackUsersNotApproving = [{ Slack_Name: "daniel", Slack_Id: "<@1111>" }];
    const slackMemberUsers = [{ Slack_Name: "daniel", Slack_Id: "<@1111>" }];

    const result = getMembersNotApproving(slackUsersNotApproving, slackMemberUsers);
    const expected = slackMemberUsers;

    expect(result).to.be.deep.equal(expected);
  });

  it("should retrieve multiple members not approving", () => {
    const slackUsersNotApproving = [{ Slack_Name: "daniel", Slack_Id: "<@1111>" },
                                    { Slack_Name: "dillon", Slack_Id: "<@1112>" },
                                    { Slack_Name: "sanket", Slack_Id: "<@1113>" }];
    const slackMemberUsers = [{ Slack_Name: "daniel", Slack_Id: "<@1111>" },
                              { Slack_Name: "dillon", Slack_Id: "<@1112>" },
                              { Slack_Name: "sanket", Slack_Id: "<@1113>" }];

    const result = getMembersNotApproving(slackUsersNotApproving, slackMemberUsers);
    const expected = slackMemberUsers;

    expect(result).to.be.deep.equal(expected);
  });

  it("should retrieve member only specific users", () => {
    const slackUsersNotApproving = [{ Slack_Name: "daniel", Slack_Id: "<@1111>" },
                                    { Slack_Name: "dinkel", Slack_Id: "<@1112>" },
                                    { Slack_Name: "andrew", Slack_Id: "<@1113>" },
                                    { Slack_Name: "dillon", Slack_Id: "<@1114>" }];
    const slackMemberUsers = [{ Slack_Name: "daniel", Slack_Id: "<@1111>" },
                              { Slack_Name: "dillon", Slack_Id: "<@1114>" },
                              { Slack_Name: "ethan", Slack_Id: "<@1115>" },
                              { Slack_Name: "harrison", Slack_Id: "<@1116>" }];

    const result = getMembersNotApproving(slackUsersNotApproving, slackMemberUsers);
    const expected = [{ Slack_Name: "daniel", Slack_Id: "<@1111>" },
                      { Slack_Name: "dillon", Slack_Id: "<@1114>" }];

    expect(result).to.be.deep.equal(expected);
  });

  it("should retrieve no members (All sub team members already approving PR)", () => {
    const slackUsersNotApproving: SlackUser[] = [];
    const slackMemberUsers = [{ Slack_Name: "daniel", Slack_Id: "<@1111>" },
                              { Slack_Name: "dillon", Slack_Id: "<@1112>" },
                              { Slack_Name: "joshua", Slack_Id: "<@1113>" }];

    const result = getMembersNotApproving(slackUsersNotApproving, slackMemberUsers);
    const expected: SlackUser[] = [];

    expect(result).to.be.deep.equal(expected);
  });
});
