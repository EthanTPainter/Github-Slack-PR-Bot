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
    const membersApproving = ["Ethan"];
    const membersReqChanges: string[] = [];
    const membersNotApproving = ["Daniel", "Dillon"];

    const result = constructPeerCheck(validJSON, membersApproving,
                        membersReqChanges, membersNotApproving);
    const expected = "0 Required Peer Approvals: Ethan :heavy_check_mark: ";

    expect(result).to.be.equal(expected);
  });

  it("construct a peer check with 0 required reviews and 0 approving", () => {
    validJSON.Options.Num_Required_Peer_Approvals = 0;
    const membersApproving: string[] = [];
    const membersReqChanges: string[] = [];
    const membersNotApproving = ["Daniel", "Dillon", "Ethan"];

    const result = constructPeerCheck(validJSON, membersApproving,
                          membersReqChanges, membersNotApproving);
    const expected = "0 Required Peer Approvals: ";

    expect(result).to.be.equal(expected);
  });

  it("construct a peer check with 1 required review and 0 approving", () => {
    validJSON.Options.Num_Required_Peer_Approvals = 1;
    const membersApproving: string[] = [];
    const membersReqChanges: string[] = [];
    const membersNotApproving = ["Daniel", "Dillon"];

    const result = constructPeerCheck(validJSON, membersApproving, membersReqChanges, membersNotApproving);
    const expected = "1 Required Peer Approval: @Daniel @Dillon ";

    expect(result).to.be.equal(expected);
  });

  it("construct a peer check with 1 required review and 1 approving", () => {
    validJSON.Options.Num_Required_Peer_Approvals = 1;
    const membersApproving = ["Ethan"];
    const membersReqChanges: string[] = [];
    const membersNotApproving = ["Daniel", "Dillon"];

    const result = constructPeerCheck(validJSON, membersApproving, membersReqChanges, membersNotApproving);
    const expected = "1 Required Peer Approval: Ethan :heavy_check_mark: ";

    expect(result).to.be.equal(expected);
  });

  it("construct a peer check with 1 required review and 2 approving", () => {
    validJSON.Options.Num_Required_Peer_Approvals = 1;
    const membersApproving = ["Ethan", "Daniel"];
    const membersReqChanges: string[] = [];
    const membersNotApproving = ["Dillon"];

    const result = constructPeerCheck(validJSON, membersApproving, membersReqChanges, membersNotApproving);
    const expected = "1 Required Peer Approval: Ethan :heavy_check_mark: Daniel :heavy_check_mark: ";

    expect(result).to.be.equal(expected);
  });

  it("construct a peer check with 2 required reviews and 1 approving", () => {
    validJSON.Options.Num_Required_Peer_Approvals = 2;
    const membersApproving = ["Ethan"];
    const membersReqChanges: string[] = [];
    const membersNotApproving = ["Daniel", "Dillon"];

    const result = constructPeerCheck(validJSON, membersApproving, membersReqChanges, membersNotApproving);
    const expected = "2 Required Peer Approvals: Ethan :heavy_check_mark: @Daniel @Dillon ";

    expect(result).to.be.equal(expected);
  });

  it("construct a peer check with 2 required reviews and 2 approving", () => {
    validJSON.Options.Num_Required_Peer_Approvals = 2;
    const membersApproving = ["Ethan", "Daniel"];
    const membersReqChanges: string[] = [];
    const membersNotApproving = ["Dillon"];

    const result = constructPeerCheck(validJSON, membersApproving, membersReqChanges, membersNotApproving);
    const expected = "2 Required Peer Approvals: Ethan :heavy_check_mark: Daniel :heavy_check_mark: ";

    expect(result).to.be.equal(expected);
  });

  it("construct a peer check with 1 required review, 0 approving, 1 requested changes", () => {
    validJSON.Options.Num_Required_Peer_Approvals = 1;
    const membersApproving: string[] = [];
    const membersReqChanges = ["ethan"];
    const membersNotApproving = ["dillon"];

    const result = constructPeerCheck(validJSON, membersApproving, membersReqChanges, membersNotApproving);
    const expected = "1 Required Peer Approval: ethan :X: ";

    expect(result).to.be.equal(expected);
  });

  it("construct a peer check with 2 required reviews, 0 approving, 1 requesting chagnes", () => {
    validJSON.Options.Num_Required_Peer_Approvals = 2;
    const membersApproving: string[] = [];
    const membersReqChanges: string[] = ["Ethan"];
    const membersNotApproving = ["Dillon"];

    const result = constructPeerCheck(validJSON, membersApproving, membersReqChanges, membersNotApproving);
    const expected = "2 Required Peer Approvals: Ethan :X: @Dillon ";

    expect(result).to.be.equal(expected);
  });

  it("construct a peer check with 2 required reviews, 0 approving, 2 requesting changes", () => {
    validJSON.Options.Num_Required_Peer_Approvals = 2;
    const membersApproving: string[] = [];
    const membersReqChanges: string[] = ["Ethan", "Daniel"];
    const membersNotApproving = ["Dillon", "Joshua"];

    const result = constructPeerCheck(validJSON, membersApproving, membersReqChanges, membersNotApproving);
    const expected = "2 Required Peer Approvals: Ethan :X: Daniel :X: ";

    expect(result).to.be.equal(expected);
  });

  it("construct a peer check with 2 required reviews, 1 approving, 1 requesting changes", () => {
    validJSON.Options.Num_Required_Peer_Approvals = 2;
    const membersApproving = ["Ethan"];
    const membersReqChanges = ["Daniel"];
    const membersNotApproving = ["Dillon", "Joshua"];

    const result = constructPeerCheck(validJSON, membersApproving, membersReqChanges, membersNotApproving);
    const expected = "2 Required Peer Approvals: Ethan :heavy_check_mark: Daniel :X: ";

    expect(result).to.be.equal(expected);
  });

  it("construct a peer check with 3 required reviews, 1 approving, 1 requesting changes", () => {
    validJSON.Options.Num_Required_Peer_Approvals = 3;
    const membersApproving = ["Ethan"];
    const membersReqChanges = ["Daniel"];
    const membersNotApproving = ["Dillon", "Joshua", "Harrison"];

    const result = constructPeerCheck(validJSON, membersApproving, membersReqChanges, membersNotApproving);
    const expected = "3 Required Peer Approvals: Ethan :heavy_check_mark: Daniel :X: @Dillon @Joshua @Harrison ";

    expect(result).to.be.equal(expected);
  });

});
