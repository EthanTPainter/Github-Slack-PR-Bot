import "mocha";
import { expect } from "chai";
import { constructPeerCheck } from "../../../../../src/slack/message/construct/checks/peer";

describe("constructPeerCheck", () => {

  const validJSON = {
    Options: {
      Check_Mark_Style: "green",
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
});
