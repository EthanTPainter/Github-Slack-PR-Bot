import { expect } from "chai";
import {
  getLeadsNotApproving,
  getLeadsApproving,
  getLeadsReqChanges,
} from "../../../../src/github/parse/groups";

describe("getLeadsApproving", () => {

  it("should retrieve one slack lead approving", () => {
    const slackUsersApproving = ["andrew"];
    const allSlackLeadUsers = ["andrew", "dinkel", "mike"];

    const result = getLeadsApproving(slackUsersApproving, allSlackLeadUsers);
    const expected = ["andrew"];

    expect(result).to.be.deep.equal(expected);
  });

  it("should retrieve many slack leads approving", () => {
    const slackUsersApproving = ["andrew", "dinkel"];
    const allSlackLeadUsers = ["andrew", "dinkel", "mike"];

    const result = getLeadsApproving(slackUsersApproving, allSlackLeadUsers);
    const expected = ["andrew", "dinkel"];

    expect(result).to.be.deep.equal(expected);
  });

  it("should not retrieve any slack leads with no approvals", () => {
    const slackUsersApproving: string[] = [];
    const allSlackLeadUsers = ["andrew", "dinkel", "mike"];

    const result = getLeadsApproving(slackUsersApproving, allSlackLeadUsers);
    const expected: string[] = [];

    expect(result).to.be.deep.equal(expected);
  });

  it("should not retrieve any slack leads with member approvals", () => {
    const slackUsersApproving = ["dillon"];
    const allSlackLeadUsers = ["andrew", "dinkel", "mike"];

    const result = getLeadsApproving(slackUsersApproving, allSlackLeadUsers);
    const expected: string[] = [];

    expect(result).to.be.deep.equal(expected);
  });

  it("should retrieve slack lead with member approvals", () => {
    const slackUsersApproving = ["andrew", "ethan", "dillon"];
    const allSlackLeadUsers = ["andrew", "dinkel", "mike"];

    const result = getLeadsApproving(slackUsersApproving, allSlackLeadUsers);
    const expected = ["andrew"];

    expect(result).to.be.deep.equal(expected);
  });
});

describe("getLeadsReqChanges", () => {

  it("should get one lead requesting changes", () => {
    const slackUsersRequestingChanges = ["andrew"];
    const allSlackLeadUsers = ["andrew", "dinkel", "mike"];

    const result = getLeadsReqChanges(slackUsersRequestingChanges,
                                    allSlackLeadUsers);
    const expected = ["andrew"];

    expect(result).to.be.deep.equal(expected);
  });

  it("should get two lead requesting changes", () => {
    const slackUsersRequestingChanges = ["andrew", "dinkel"];
    const allSlackLeadUsers = ["andrew", "dinkel", "mike"];

    const result = getLeadsReqChanges(slackUsersRequestingChanges,
                                    allSlackLeadUsers);
    const expected = ["andrew", "dinkel"];

    expect(result).to.be.deep.equal(expected);
  });

  it("should not get any lead requesting changes", () => {
    const slackUsersRequestingChanges: string[] = [];
    const allSlackLeadUsers = ["andrew", "dinkel", "mike"];

    const result = getLeadsReqChanges(slackUsersRequestingChanges,
                                    allSlackLeadUsers);
    const expected: string[] = [];

    expect(result).to.be.deep.equal(expected);
  });

  it("should get lead requesting changes with other slack users", () => {
    const slackUsersRequestingChanges = ["ethan", "andrew", "dillon"];
    const allSlackLeadUsers = ["andrew", "dinkel", "mike"];

    const result = getLeadsReqChanges(slackUsersRequestingChanges,
                                    allSlackLeadUsers);
    const expected = ["andrew"];

    expect(result).to.be.deep.equal(expected);
  });

  it("should get leads requesting changes with other slack users", () => {
    const slackUsersRequestingChanges = ["ethan", "mike", "dinkel"];
    const allSlackLeadUsers = ["andrew", "dinkel", "mike"];

    const result = getLeadsReqChanges(slackUsersRequestingChanges,
                                    allSlackLeadUsers);
    const expected = ["mike", "dinkel"];

    expect(result).to.be.deep.equal(expected);
  });

});

describe("getLeadsNotApproving", () => {
  it("should retrieve slack lead not approving", () => {
    const slackUsersNotApproving = ["andrew", "dillon", "daniel"];
    const allSlackLeadUsers = ["andrew"];

    const result = getLeadsNotApproving(slackUsersNotApproving, allSlackLeadUsers);
    const expected = ["andrew"];

    expect(result).to.be.deep.equal(expected);
  });

  it("should not retrieve any slack leads", () => {
    const slackUsersNotApproving = ["andrew", "dillon", "daniel"];
    const allSlackLeadUsers = ["dinkel"];

    const result = getLeadsNotApproving(slackUsersNotApproving, allSlackLeadUsers);
    const expected: string[] = [];

    expect(result).to.be.deep.equal(expected);
  });

  it("should not retrieve all slack users not approving", () => {
    const slackUsersNotApproving = ["andrew", "dinkel", "marwan"];
    const allSlackLeadUsers = ["andrew", "dinkel", "marwan"];

    const result = getLeadsNotApproving(slackUsersNotApproving, allSlackLeadUsers);
    const expected = allSlackLeadUsers;

    expect(result).to.be.deep.equal(expected);
  });
});
