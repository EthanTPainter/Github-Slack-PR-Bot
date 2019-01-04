export class Approve {

  /**
   * @author Ethan T Painter
   * @description Function used to construct the description
   * @param slackUser Slack user who owns the PR
   * @param slackUserApproving Slack user who is approving the PR
   * @returns string of the description for the Slack Message
   */
  constructDescription(slackUser: string,
                       slackUserApproving: string,
                      ): string {

    const desc: string = `@${slackUser} has approved this PR. (Owner: @${slackUserApproving})`;
    return desc;
  }

  getApprovals(leadApproved: boolean,
               peerApproved: boolean,
               needLeadApprovals: string[],
               needMemberApprovals: string[],
               ): string {

    return "";
  }

  /**
   * @author Ethan T Painter
   * @description Retrieve the Owner of the PR
   * @param event Event received from the GitHub webhook
   * @returns String of the user who opened the PR
   */
  getOwner(event: any): string {
    try {
      const owner: string = event.pull_request.login;
      return owner;
    }
    catch (error) {
      throw new Error("event.pull_request.login not found in event");
    }
  }

  /**
   * @author Ethan T Painter
   * @description Retrieve the user who is approving the PR
   * @param event Event received from the GitHub webhook
   * @returns String of the user approving the PR
   */
  getUserApproving(event: any): string {
    try {
      const user: string = event.sender.login;
      return user;
    }
    catch (error) {
      throw new Error("event.sender.login not found in event");
    }
  }

  /**
   * @author Ethan T Painter
   * @description Retrieve whether a peer has approved a PR
   * @param event Event received from the GitHub webhook
   * @returns Boolean of whether a peer has approved the PR or not
   */
  getMemberApproval(reviews: any): boolean {
    return false;
  }

  /**
   * @author Ethan T Painter
   * @description Generate a list of members to @ in Slack.
   *              Will be none, [], if the only member has
   *              already approve it.
   * @param members Members in a team
   * @param membersExempt Members exempt from being At'ed (@) in Slack
   *        since they're already involved in owning/approving the PR
   * @returns String[] of members to @ in Slack
   */
  getMemberList(members: string[], membersExempt: string[]): string[] {
    const group: string[] = [];
    let counter: number = 0;
    // Loop through members. If a member is in membersExempt
    // don't add them to group (they're exempt). Otherwise, add them.
    if (members.length === 0) {
      throw new Error("No team members found");
    }
    // Loop through members
    while (counter < members.length) {
      let exemptCounter: number = 0;
      let found: boolean = false;
      // Loop through membersExempt
      while (exemptCounter < membersExempt.length) {
        if (members[counter] === membersExempt[exemptCounter]) {
          found = true;
        }
        exemptCounter++;
      }
      // After looping through members Exempt once
      // If found is true, don't add to group
      // If found is false, add to group
      if (found === false) {
        group.push(members[counter]);
      }
      counter++;
    }
    return group;
  }

  /**
   * @author Ethan T Painter
   * @description Retrieve whether a lead has approved a PR
   * @param event Event received from the GitHub webhook
   * @returns Boolean of whether a lead has approved the PR or not
   */
  getLeadApproval(event: any): boolean {
    return false;
  }

  /**
   * @author Ethan T Painter
   * @description Get list of leads to @ in Slack.
   *        Will be none, [], if the only lead has
   *         already approved it.
   * @param leads Leads in a team
   * @param leadsExempt Leads exempt from being At'ed (@) in Slack
   *        since they're already invovled in owning/approving the PR
   */
  getLeadList(leads: string[], leadsExempt: string[]): string[] {
    const group: string[] = [];
    let counter: number = 0;
    // Loop through leads. If a lead is in leadsExempt
    // don't add them to group (they're exempt). Otherwise, add them
    if (leads.length === 0) {
      throw new Error("No team leads found");
    }
    // Loop through members
    while (counter < leads.length) {
      let exemptCounter: number = 0;
      let found: boolean = false;
      // Loop through leadsExempt
      while (exemptCounter < leadsExempt.length) {
        if (leads[counter] === leadsExempt[exemptCounter]) {
          found = true;
        }
        exemptCounter++;
      }
      // After looping through members Exempt once
      // If found is true, don't add to group
      // If found is false, add to group
      if (found === false) {
        group.push(leads[counter]);
      }
      counter++;
    }
    return group;
  }
}
