import { expect } from "chai";
import {
  getMembersApproving,
  getMembersReqChanges,
  getMembersNotApproving,
} from "../../../../src/github/parse/groups/members";

describe("getMembersApproving", () => {

  it("should get a member approving", () => {
    const slackUsersApproving = ["ethan"];
    const allSlackLeadUsers = ["ethan", "daniel", "harrison", "ben"];

    const result = getMembersApproving(slackUsersApproving,
                                    allSlackLeadUsers);
    const expected = ["ethan"];

    expect(result).to.be.deep.equal(expected);
  });

  it("should get many members approving", () => {
    const slackUsersApproving = ["ethan", "daniel"];
    const allSlackLeadUsers = ["ethan", "daniel", "harrison", "ben"];

    const result = getMembersApproving(slackUsersApproving,
                                    allSlackLeadUsers);
    const expected = ["ethan", "daniel"];

    expect(result).to.be.deep.equal(expected);
  });

  it("should get a member with other users approving", () => {
    const slackUsersApproving = ["ethan", "andrew", "mike"];
    const allSlackLeadUsers = ["ethan", "daniel", "harrison", "ben"];

    const result = getMembersApproving(slackUsersApproving,
                                    allSlackLeadUsers);
    const expected = ["ethan"];

    expect(result).to.be.deep.equal(expected);
  });

  it("should not get any members approving", () => {
    const slackUsersApproving: string[] = [];
    const allSlackLeadUsers = ["ethan", "daniel", "harrison", "ben"];

    const result = getMembersApproving(slackUsersApproving,
                                    allSlackLeadUsers);
    const expected: string[] = [];

    expect(result).to.be.deep.equal(expected);
  });

  it("should not get any members approving with leads approving", () => {
    const slackUsersApproving = ["andrew"];
    const allSlackLeadUsers = ["ethan", "daniel", "harrison", "ben"];

    const result = getMembersApproving(slackUsersApproving,
                                    allSlackLeadUsers);
    const expected: string[] = [];

    expect(result).to.be.deep.equal(expected);
  });

});

describe("getMembersReqChanges", () => {

  it("should get a member requesting changes", () => {
    const slackUsersReqChanges = ["ethan"];
    const allSlackLeadUsers = ["ethan", "daniel", "harrison", "ben"];

    const result = getMembersApproving(slackUsersReqChanges,
                                    allSlackLeadUsers);
    const expected = ["ethan"];

    expect(result).to.be.deep.equal(expected);
  });

  it("should get many members requesting changes", () => {
    const slackUsersReqChanges = ["ethan", "harrison"];
    const allSlackLeadUsers = ["ethan", "daniel", "harrison", "ben"];

    const result = getMembersApproving(slackUsersReqChanges,
                                    allSlackLeadUsers);
    const expected = ["ethan", "harrison"];

    expect(result).to.be.deep.equal(expected);
  });

  it("should get a member requesting changes with other users", () => {
    const slackUsersReqChanges = ["ethan", "dinkel"];
    const allSlackLeadUsers = ["ethan", "daniel", "harrison", "ben"];

    const result = getMembersApproving(slackUsersReqChanges,
                                    allSlackLeadUsers);
    const expected = ["ethan"];

    expect(result).to.be.deep.equal(expected);
  });

  it("should get many members requesting changes with other users", () => {
    const slackUsersReqChanges = ["ethan", "harrison", "dinkel", "andrew"];
    const allSlackLeadUsers = ["ethan", "daniel", "harrison", "ben"];

    const result = getMembersApproving(slackUsersReqChanges,
                                    allSlackLeadUsers);
    const expected = ["ethan", "harrison"];

    expect(result).to.be.deep.equal(expected);
  });

  it("should not get any members requesting changes", () => {
    const slackUsersReqChanges: string[] = [];
    const allSlackLeadUsers = ["ethan", "daniel", "harrison", "ben"];

    const result = getMembersApproving(slackUsersReqChanges,
                                    allSlackLeadUsers);
    const expected: string[] = [];

    expect(result).to.be.deep.equal(expected);
  });

  it("should not get any members requesting changes with other users", () => {
    const slackUsersReqChanges = ["andrew", "dinkel"];
    const allSlackLeadUsers = ["ethan", "daniel", "harrison", "ben"];

    const result = getMembersApproving(slackUsersReqChanges,
                                    allSlackLeadUsers);
    const expected: string[] = [];

    expect(result).to.be.deep.equal(expected);
  });

});

describe("getMembersNotApproving", () => {
  it("should retrieve a member not approving", () => {
    const slackUsersNotApproving = ["daniel"];
    const slackMemberUsers = ["daniel"];

    const result = getMembersNotApproving(slackUsersNotApproving, slackMemberUsers);
    const expected = slackMemberUsers;

    expect(result).to.be.deep.equal(expected);
  });

  it("should retrieve multiple members not approving", () => {
    const slackUsersNotApproving = ["daniel", "dillon", "sanket"];
    const slackMemberUsers = ["daniel", "dillon", "sanket"];

    const result = getMembersNotApproving(slackUsersNotApproving, slackMemberUsers);
    const expected = slackMemberUsers;

    expect(result).to.be.deep.equal(expected);
  });

  it("should retrieve member only specific users", () => {
    const slackUsersNotApproving = ["daniel", "dinkel", "andrew", "dillon"];
    const slackMemberUsers = ["daniel", "dillon", "ethan", "harrison"];

    const result = getMembersNotApproving(slackUsersNotApproving, slackMemberUsers);
    const expected = ["daniel", "dillon"];

    expect(result).to.be.deep.equal(expected);
  });

  it("should retrieve no members (All sub team members already approving PR)", () => {
    const slackUsersNotApproving: string[] = [];
    const slackMemberUsers = ["daniel", "dillon", "joshua"];

    const result = getMembersNotApproving(slackUsersNotApproving, slackMemberUsers);
    const expected: string[] = [];

    expect(result).to.be.deep.equal(expected);
  });
});
