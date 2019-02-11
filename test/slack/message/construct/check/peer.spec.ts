import { SlackUser } from "../../../../../src/models";
import { expect } from "chai";
import { constructPeerCheck } from "../../../../../src/slack/message/construct/checks/peer";

describe("constructPeerCheck", () => {

  const validJSON = {
    Options: {
      Check_Mark_Style: "green",
      X_Mark_Style: "base",
      Num_Required_Peer_Approvals: 0,
    },
  };

  it("construct a peer check with 0 required reviews and 1 approving", () => {
    validJSON.Options.Num_Required_Peer_Approvals = 0;
    const membersApproving = [{ Slack_Name: "Ethan", Slack_Id: "<@1234>" }];
    const membersReqChanges: SlackUser[] = [];
    const membersNotApproving = [{ Slack_Name: "Daniel", Slack_Id: "<@2345>" },
                                 { Slack_Name: "Dillon", Slack_Id: "<@3456>" }];

    const result = constructPeerCheck(validJSON, membersApproving,
                        membersReqChanges, membersNotApproving);
    const expected = `0 Required Peer Approvals: ${membersApproving[0].Slack_Name} :heavy_check_mark: `;

    expect(result).to.be.equal(expected);
  });

  it("construct a peer check with 0 required reviews and 0 approving", () => {
    validJSON.Options.Num_Required_Peer_Approvals = 0;
    const membersApproving: SlackUser[] = [];
    const membersReqChanges: SlackUser[] = [];
    const membersNotApproving = [{ Slack_Name: "Daniel", Slack_Id: "<@1111>" },
                                 { Slack_Name: "Dillon", Slack_Id: "<@2222>" },
                                 { Slack_Name: "Ethan", Slack_Id: "<@3333>" }];

    const result = constructPeerCheck(validJSON, membersApproving,
                          membersReqChanges, membersNotApproving);
    const expected = "0 Required Peer Approvals: ";

    expect(result).to.be.equal(expected);
  });

  it("construct a peer check with 1 required review and 0 approving", () => {
    validJSON.Options.Num_Required_Peer_Approvals = 1;
    const membersApproving: SlackUser[] = [];
    const membersReqChanges: SlackUser[] = [];
    const membersNotApproving = [{ Slack_Name: "Daniel", Slack_Id: "<@1111>" },
                                 { Slack_Name: "Dillon", Slack_Id: "<@2222>" }];

    const result = constructPeerCheck(validJSON, membersApproving, membersReqChanges, membersNotApproving);
    const expected = `1 Required Peer Approval: ${membersNotApproving[0].Slack_Id} ${membersNotApproving[1].Slack_Id} `;

    expect(result).to.be.equal(expected);
  });

  it("construct a peer check with 1 required review and 1 approving", () => {
    validJSON.Options.Num_Required_Peer_Approvals = 1;
    const membersApproving = [{ Slack_Name: "Ethan", Slack_Id: "<@1111>" }];
    const membersReqChanges: SlackUser[] = [];
    const membersNotApproving = [{ Slack_Name: "Daniel", Slack_Id: "<@2222>" },
                                 { Slack_Name: "Dillon", Slack_Id: "<@3333>" }];

    const result = constructPeerCheck(validJSON, membersApproving, membersReqChanges, membersNotApproving);
    const expected = "1 Required Peer Approval: Ethan :heavy_check_mark: ";

    expect(result).to.be.equal(expected);
  });

  it("construct a peer check with 1 required review and 2 approving", () => {
    validJSON.Options.Num_Required_Peer_Approvals = 1;
    const membersApproving = [{ Slack_Name: "Ethan", Slack_Id: "<@1111>" },
                              { Slack_Name: "Daniel", Slack_Id: "<@2222>" }];
    const membersReqChanges: SlackUser[] = [];
    const membersNotApproving = [{ Slack_Name: "Dillon", Slack_Id: "<@3333>" }];

    const result = constructPeerCheck(validJSON, membersApproving, membersReqChanges, membersNotApproving);
    const expected = `1 Required Peer Approval: ${membersApproving[0].Slack_Name} :heavy_check_mark: `
      + `${membersApproving[1].Slack_Name} :heavy_check_mark: `;

    expect(result).to.be.equal(expected);
  });

  it("construct a peer check with 2 required reviews and 1 approving", () => {
    validJSON.Options.Num_Required_Peer_Approvals = 2;
    const membersApproving = [{ Slack_Name: "Ethan", Slack_Id: "<@1111>" }];
    const membersReqChanges: SlackUser[] = [];
    const membersNotApproving = [{ Slack_Name: "Daniel", Slack_Id: "<@2222>" },
                                 { Slack_Name: "Dillon", Slack_Id: "<@3333>" }];

    const result = constructPeerCheck(validJSON, membersApproving, membersReqChanges, membersNotApproving);
    const expected = `2 Required Peer Approvals: ${membersApproving[0].Slack_Name} :heavy_check_mark: `
      + `${membersNotApproving[0].Slack_Id} ${membersNotApproving[1].Slack_Id} `;

    expect(result).to.be.equal(expected);
  });

  it("construct a peer check with 2 required reviews and 2 approving", () => {
    validJSON.Options.Num_Required_Peer_Approvals = 2;
    const membersApproving = [{ Slack_Name: "Ethan", Slack_Id: "<@1111>" },
                              { Slack_Name: "Daniel", Slack_Id: "<@2222>" }];
    const membersReqChanges: SlackUser[] = [];
    const membersNotApproving = [{ Slack_Name: "Dillon", Slack_Id: "<@3333>" }];

    const result = constructPeerCheck(validJSON, membersApproving, membersReqChanges, membersNotApproving);
    const expected = `2 Required Peer Approvals: ${membersApproving[0].Slack_Name} :heavy_check_mark: `
      + `${membersApproving[1].Slack_Name} :heavy_check_mark: `;

    expect(result).to.be.equal(expected);
  });

  it("construct a peer check with 1 required review, 0 approving, 1 requested changes", () => {
    validJSON.Options.Num_Required_Peer_Approvals = 1;
    const membersApproving: SlackUser[] = [];
    const membersReqChanges = [{ Slack_Name: "ethan", Slack_Id: "<@1111>" }];
    const membersNotApproving = [{ Slack_Name: "dillon", Slack_Id: "<@2222>" }];

    const result = constructPeerCheck(validJSON, membersApproving, membersReqChanges, membersNotApproving);
    const expected = `1 Required Peer Approval: ${membersReqChanges[0].Slack_Name} :X: `;

    expect(result).to.be.equal(expected);
  });

  it("construct a peer check with 2 required reviews, 0 approving, 1 requesting chagnes", () => {
    validJSON.Options.Num_Required_Peer_Approvals = 2;
    const membersApproving: SlackUser[] = [];
    const membersReqChanges = [{ Slack_Name: "Ethan", Slack_Id: "<@1111>" }];
    const membersNotApproving = [{ Slack_Name: "Dillon", Slack_Id: "<@2222>" }];

    const result = constructPeerCheck(validJSON, membersApproving, membersReqChanges, membersNotApproving);
    const expected = `2 Required Peer Approvals: ${membersReqChanges[0].Slack_Name} :X: `
      + `${membersNotApproving[0].Slack_Id} `;

    expect(result).to.be.equal(expected);
  });

  it("construct a peer check with 2 required reviews, 0 approving, 2 requesting changes", () => {
    validJSON.Options.Num_Required_Peer_Approvals = 2;
    const membersApproving: SlackUser[] = [];
    const membersReqChanges = [{ Slack_Name: "Ethan", Slack_Id: "<@1111>" },
                               { Slack_Name: "Daniel", Slack_Id: "<@2222>" }];
    const membersNotApproving = [{ Slack_Name: "Dillon", Slack_Id: "<@3333>" },
                                 { Slack_Name: "Joshua", Slack_Id: "<@4444>" }];

    const result = constructPeerCheck(validJSON, membersApproving, membersReqChanges, membersNotApproving);
    const expected = "2 Required Peer Approvals: Ethan :X: Daniel :X: ";

    expect(result).to.be.equal(expected);
  });

  it("construct a peer check with 2 required reviews, 1 approving, 1 requesting changes", () => {
    validJSON.Options.Num_Required_Peer_Approvals = 2;
    const membersApproving = [{ Slack_Name: "Ethan", Slack_Id: "<@1111>" }];
    const membersReqChanges = [{ Slack_Name: "Daniel", Slack_Id: "<@2222>" }];
    const membersNotApproving = [{ Slack_Name: "Dillon", Slack_Id: "<@3333" },
                                 { Slack_Name: "Joshua", Slack_Id: "<@4444>" }];

    const result = constructPeerCheck(validJSON, membersApproving, membersReqChanges, membersNotApproving);
    const expected = `2 Required Peer Approvals: ${membersApproving[0].Slack_Name} :heavy_check_mark: `
      + `${membersReqChanges[0].Slack_Name} :X: `;

    expect(result).to.be.equal(expected);
  });

  it("construct a peer check with 3 required reviews, 1 approving, 1 requesting changes", () => {
    validJSON.Options.Num_Required_Peer_Approvals = 3;
    const membersApproving = [{ Slack_Name: "Ethan", Slack_Id: "<@1111>" }];
    const membersReqChanges = [{ Slack_Name: "Daniel", Slack_Id: "<@2222>"}];
    const membersNotApproving = [{ Slack_Name: "Dillon", Slack_Id: "<@3333>" },
                                 { Slack_Name: "Joshua", Slack_Id: "<@4444>" },
                                 { Slack_Name: "Harrison", Slack_Id: "<@5555>" }];

    const result = constructPeerCheck(validJSON, membersApproving, membersReqChanges, membersNotApproving);
    const expected = `3 Required Peer Approvals: ${membersApproving[0].Slack_Name} :heavy_check_mark: `
      + `${membersReqChanges[0].Slack_Name} :X: ${membersNotApproving[0].Slack_Id} ${membersNotApproving[1].Slack_Id} `
      + `${membersNotApproving[2].Slack_Id} `;

    expect(result).to.be.equal(expected);
  });

});
