import "mocha";
import { expect } from "chai";
import {
  getMembersApproving,
  getMembersReqChanges,
  getMembersNotApproving,
} from "../../../../src/github/parse/groups/members";

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
