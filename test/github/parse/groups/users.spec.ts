import { expect } from "chai";
import {
  getUsersApproving,
  getUsersReqChanges,
  getUsersNotApproving,
} from "../../../../src/github/parse/groups/users";

describe("getUsersApproving", () => {

  const json = {
    Teams: {
      DevTeam: {
        DevTeam1: {
          Users: {
            Leads: {
              andrew: "Andrew1",
            },
            Members: {
              EthanTPainter: "ethan2",
              Greek8eos: "GeorgeMaurk",
              DillonSykes: "DillPickle",
            },
          },
        },
      },
    },
  };

  it("should retrieve slack name for only approving user", () => {
    const usersApproving = ["EthanTPainter"];

    const result = getUsersApproving(usersApproving, json);
    const expected = ["ethan2"];

    expect(result).to.be.deep.equal(expected);
  });

  it("should retrieve all users who approved the PR", () => {
    const usersApproving = ["EthanTPainter", "Greek8eos", "andrew"];

    const result = getUsersApproving(usersApproving, json);
    const expected = ["ethan2", "GeorgeMaurk", "Andrew1"];

    expect(result).to.be.deep.equal(expected);
  });

  it("should return an empty array when no users are approving", () => {
    const usersApproving: string[] = [];

    const result = getUsersApproving(usersApproving, json);
    const expected: string[] = [];

    expect(result).to.be.deep.equal(expected);
  });

  it("should retrieve all users who approved even if they're in different sub teams", () => {
    const usersApproving = ["harrison", "EthanTPainter"];
    const json2 = {
      Teams: {
        DevTeam: {
          DevTeam1: {
            Users: {
              Leads: {
                andrew: "Andrew1",
              },
              Members: {
                EthanTPainter: "ethan2",
                Greek8eos: "GeorgeMaurk",
                DillonSykes: "DillPickle",
              },
            },
          },
          DevTeam2: {
            Users: {
              Leads: {
                dinkel: "TheDinkster",
              },
              Members: {
                harrison: "Crews",
                sanket: "CodeProdigy",
              },
            },
          },
        },
      },
    };

    const result = getUsersApproving(usersApproving, json2);
    const expected = ["Crews", "ethan2"];

    expect(result).to.be.deep.equal(expected);
  });

  it("should throw an error when an approving user cannot be found", () => {
    const usersApproving = ["BillyBob"];

    const expected = new Error(`GitHub user: ${usersApproving[0]} could not be ` +
      `found in JSON file`);

    expect(() => getUsersApproving(usersApproving, json)).to.throw(expected.message);
  });
});

describe("getUsersReqChanges", () => {

  const json = {
    Teams: {
      DevTeam: {
        DevTeam1: {
          Users: {
            Leads: {
              andrew: "Andrew1",
            },
            Members: {
              EthanTPainter: "ethan2",
              Greek8eos: "GeorgeMaurk",
              DillonSykes: "DillPickle",
            },
          },
        },
      },
    },
  };

  it("should get one user requesting changes", () => {
    const reviews = ["EthanTPainter"];

    const result = getUsersReqChanges(reviews, json);
    const expected = ["ethan2"];

    expect(result).to.be.deep.equal(expected);
  });

  it("should get multiple users requesting changes", () => {
    const reviews = ["EthanTPainter", "Greek8eos"];

    const result = getUsersReqChanges(reviews, json);
    const expected = ["ethan2", "GeorgeMaurk"];

    expect(result).to.be.deep.equal(expected);
  });

  it("should get all users requesting changes", () => {
    const reviews = ["EthanTPainter", "Greek8eos", "DillonSykes", "andrew"];

    const result = getUsersReqChanges(reviews, json);
    const expected = ["ethan2", "GeorgeMaurk", "DillPickle", "Andrew1"];

    expect(result).to.be.deep.equal(expected);
  });

  it("should not get any users requesting changes", () => {
    const reviews: string[] = [];

    const result = getUsersReqChanges(reviews, json);
    const expected: string[] = [];

    expect(result).to.be.deep.equal(expected);
  });

});

describe("getUsersNotApproving", () => {
  it("should retrieve all users not approving or requesting changes to the PR", () => {
    const slackOwner = "ethan";
    const slackUsersApproving = ["daniel"];
    const slackUsersRequestingChanges: string[] = ["dillon"];
    const allSlackUsers = ["andrew", "ethan", "daniel", "dillon"];

    const result = getUsersNotApproving(slackOwner, slackUsersApproving,
      slackUsersRequestingChanges, allSlackUsers);

    const expected = ["andrew"];

    expect(result).to.be.deep.equal(expected);
  });

  it("should retrieve no users when all possible users approve the PR", () => {
    const slackOwner = "ethan";
    const slackUsersApproving = ["daniel", "andrew", "dillon"];
    const slackUsersRequestingChanges: string[] = [];
    const allSlackUsers = ["andrew", "ethan", "daniel", "dillon"];

    const result = getUsersNotApproving(slackOwner, slackUsersApproving,
      slackUsersRequestingChanges, allSlackUsers);

    const expected: string[] = [];

    expect(result).to.be.deep.equal(expected);
  });

  it("should retrieve all slack users except the owner", () => {
    const slackOwner = "ethan";
    const slackUsersApproving: string[] = [];
    const slackUsersRequestingChanges: string[] = [];
    const allSlackUsers = ["andrew", "ethan", "daniel", "dillon"];

    const result = getUsersNotApproving(slackOwner, slackUsersApproving,
      slackUsersRequestingChanges, allSlackUsers);

    const expected = ["andrew", "daniel", "dillon"];

    expect(result).to.be.deep.equal(expected);
  });

  it("should retrieve no users when all possible users request changes to the PR", () => {
    const slackOwner = "ethan";
    const slackUsersApproving: string[] = [];
    const slackUsersRequestingChanges: string[] = ["andrew", "daniel", "dillon"];
    const allSlackUsers = ["andrew", "ethan", "daniel", "dillon"];

    const result = getUsersNotApproving(slackOwner, slackUsersApproving,
      slackUsersRequestingChanges, allSlackUsers);

    const expected: string[] = [];

    expect(result).to.be.deep.equal(expected);
  });

  it("should retrieve remaining users when some approve and request changes to the PR", () => {
    const slackOwner = "ethan";
    const slackUsersApproving = ["andrew"];
    const slackUsersRequestingChanges = ["daniel"];
    const allSlackUsers = ["andrew", "ethan", "daniel", "dillon"];

    const result = getUsersNotApproving(slackOwner, slackUsersApproving,
      slackUsersRequestingChanges, allSlackUsers);

    const expected = ["dillon"];

    expect(result).to.be.deep.equal(expected);
  });
});