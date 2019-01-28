import "mocha";
import { expect } from "chai";
import {
  getApprovingReviews,
  getUsersApproving,
  getUsersNotApproving,
  getLeadsNotApproving,
  getMembersNotApproving,
} from "../../../../src/github/parse/reviews/approve";

describe("getApprovingReviews", () => {
  it("should filter approving reviews from submitted reviews", () => {
    const reviews = {
      DillonSykes: "APPROVED",
      EthanTPainter: "COMMENTED",
      Greek8eos: "CHANGES_REQUESTED",
    };

    const result = getApprovingReviews(reviews);
    const expected = ["DillonSykes"];

    expect(result).to.be.deep.equal(expected);
  });

  it("should get all users", () => {
    const reviews = {
      DillonSykes: "APPROVED",
      EthanTPainter: "APPROVED",
      Greek8eos: "APPROVED",
    };

    const result = getApprovingReviews(reviews);
    const expected = ["DillonSykes", "EthanTPainter", "Greek8eos"];

    expect(result).to.be.deep.equal(expected);
  });

  it("should get an empty array when no reviews provided", () => {
    const reviews = { None: "No Reviews" };

    const result = getApprovingReviews(reviews);
    const expected: string[] = [];

    expect(result).to.be.deep.equal(expected);
  });

  it("should get empty array with no approving reviews", () => {
    const reviews = {
      DillonSykes: "COMMENTED",
      EthanTPainter: "REQUESTED_CHANGES",
      Greek8eos: "COMMENTED",
    };

    const result = getApprovingReviews(reviews);
    const expected: string[] = [];

    expect(result).to.be.deep.equal(expected);
  });

});

describe("getUsersApproving", () => {
  it("should retrieve slack name for only approving user", () => {
    const usersApproving = ["EthanTPainter"];
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

    const result = getUsersApproving(usersApproving, json);
    const expected = ["ethan2"];

    expect(result).to.be.deep.equal(expected);
  });

  it("should retrieve all users who approved the PR", () => {
    const usersApproving = ["EthanTPainter", "Greek8eos", "andrew"];
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

    const result = getUsersApproving(usersApproving, json);
    const expected = ["ethan2", "GeorgeMaurk", "Andrew1"];

    expect(result).to.be.deep.equal(expected);
  });

  it("should return an empty array when no users are approving", () => {
    const usersApproving: string[] = [];
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

    const result = getUsersApproving(usersApproving, json);
    const expected: string[] = [];

    expect(result).to.be.deep.equal(expected);
  });

  it("should retrieve all users who approved even if they're in different sub teams", () => {
    const usersApproving = ["harrison", "EthanTPainter"];
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

    const result = getUsersApproving(usersApproving, json);
    const expected = ["Crews", "ethan2"];

    expect(result).to.be.deep.equal(expected);
  });

  it("should throw an error when an approving user cannot be found", () => {
    const usersApproving = ["BillyBob"];
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

    const expected = new Error(`GitHub user: ${usersApproving[0]} could not be ` +
      `found in JSON file`);

    expect(() => getUsersApproving(usersApproving, json)).to.throw(expected.message);
  });
});

describe("getUsersNotApproving", () => {
  it("should retrieve all users not approving the PR", () => {
    const slackOwner = "ethan";
    const slackUsersApproving = ["daniel"];
    const allSlackUsers = ["andrew", "ethan", "daniel", "dillon"];

    const result = getUsersNotApproving(slackOwner, slackUsersApproving, allSlackUsers);
    const expected = ["andrew", "dillon"];

    expect(result).to.be.deep.equal(expected);
  });

  it("should retrieve no users when all possible users approve the PR", () => {
    const slackOwner = "ethan";
    const slackUsersApproving = ["daniel", "andrew", "dillon"];
    const allSlackUsers = ["andrew", "ethan", "daniel", "dillon"];

    const result = getUsersNotApproving(slackOwner, slackUsersApproving, allSlackUsers);
    const expected: string[] = [];

    expect(result).to.be.deep.equal(expected);
  });

  it("should retrieve all slack users except the owner", () => {
    const slackOwner = "ethan";
    const slackUsersApproving: string[] = [];
    const allSlackUsers = ["andrew", "ethan", "daniel", "dillon"];

    const result = getUsersNotApproving(slackOwner, slackUsersApproving, allSlackUsers);
    const expected = ["andrew", "daniel", "dillon"];

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
