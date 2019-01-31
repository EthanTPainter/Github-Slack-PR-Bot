import "mocha";
import { constructApproveDesc, getMemberList, getLeadList } from "../../../../../src/slack/message/formatting";
import { expect } from "chai";

describe("constructApproveDesc", () => {

  it("should construct a valid description", () => {
    const slackUser = "EthanPainter";
    const slackUserApproving = "dsykes";

    const result = constructApproveDesc(slackUser, slackUserApproving);
    const expected = `${slackUserApproving} has approved this PR. Owner: @${slackUser}`;

    expect(result).to.be.equal(expected);
  });

  it("should throw an error -- No Slack User provided", () => {
    const slackUser = "";
    const slackUserApproving = "dsykes";

    const expected = new Error("No slackUser provided");

    expect(() => constructApproveDesc(slackUser, slackUserApproving))
      .to.throw(expected.message);
  });

  it("should throw an error -- No slackUserApproving provided", () => {
    const slackUser = "EthanPainter";
    const slackUserApproving = "";

    const expected = new Error("No slackUserApproving provided");

    expect(() => constructApproveDesc(slackUser, slackUserApproving))
      .to.throw(expected.message);
  });
});

describe("getMemberList", () => {
  it("should return a list of members not in membersExempt", () => {
    const members = ["Ethan", "Dillon", "Joshua", "Daniel"];
    const membersExempt = ["Ethan"];

    const result = getMemberList(members, membersExempt);
    const expected = ["Dillon", "Joshua", "Daniel"];

    expect(result).to.be.deep.equal(expected);
  });

  it("should return an empty list", () => {
    const members = ["Ethan"];
    const membersExempt = ["Ethan"];

    const result = getMemberList(members, membersExempt);
    const expected: string[] = [];

    expect(result).to.be.deep.equal(expected);
  });

  it("should return all members", () => {
    const members = ["Ethan", "Dillon", "Joshua", "Daniel"];
    const membersExempt: string[] = [];

    const result = getMemberList(members, membersExempt);
    const expected = members;

    expect(result).to.be.deep.equal(expected);
  });

  it("should throw an error -- No members in array", () => {
    const members: string[] = [];
    const membersExempt = ["Ethan", "Dillon"];

    const expected = new Error("No team members found");

    expect(() => getMemberList(members, membersExempt))
      .to.throw(expected.message);
  });
});

describe("getLeadList", () => {

  it("should return a list of leads not in members exempt", () => {
    const leads = ["acurcie", "dinkel"];
    const leadsExempt = ["acurcie"];

    const result = getLeadList(leads, leadsExempt);
    const expected = ["dinkel"];

    expect(result).to.be.deep.equal(expected);
  });

  it("should return an empty list", () => {
    const leads = ["acurcie"];
    const leadsExempt = ["acurcie"];

    const result = getLeadList(leads, leadsExempt);
    const expected: string[] = [];

    expect(result).to.be.deep.equal(expected);
  });

  it("should return all leads", () => {
    const leads = ["acurcie", "dinkel"];
    const leadsExempt: string[] = [];

    const result = getLeadList(leads, leadsExempt);
    const expected = leads;

    expect(result).to.be.deep.equal(expected);
  });

  it("should throw an error -- No leads in array", () => {
    const leads: string[] = [];
    const leadsExempt = ["acurcie"];

    const expected = new Error("No team leads found");

    expect(() => getLeadList(leads, leadsExempt))
      .to.throw(expected.message);
  });
});
