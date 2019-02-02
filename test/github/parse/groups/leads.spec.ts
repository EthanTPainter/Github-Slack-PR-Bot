import { expect } from "chai";
import { getLeadsNotApproving } from "../../../../src/github/parse/groups";

describe("getLeadsApproving", () => {
  it("should retrieve slack lead approving", () => {
    const slackUsersApproving = [];
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
