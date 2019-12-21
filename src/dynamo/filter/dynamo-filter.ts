import { PullRequest } from "../../models";

interface IDynamoFilter {
	filterLeadApprovedPRs(queue: PullRequest[]): PullRequest[];
	filterMemberApprovedPRs(queue: PullRequest[]): PullRequest[];
  filterMergablePRs(queue: PullRequest[]): PullRequest[];
  filterNoFullyApprovedPRs(queue: PullRequest[]): PullRequest[];
}

export class DynamoFilter implements IDynamoFilter {
	/**
	 * @description Filter PRs only fully approved by leads
	 * @param queue A queue of PRs
	 */
	filterLeadApprovedPRs(queue: PullRequest[]): PullRequest[] {
		const leadApprovedPRs = queue.filter((leadApprovedPR: PullRequest) => {
			return (
				leadApprovedPR.member_complete === false &&
				leadApprovedPR.lead_complete === true
			);
		});
		return leadApprovedPRs;
	}

	/**
	 * @description Filter PRs only fully approved by members
	 * @param queue A queue of PRs
	 */
	filterMemberApprovedPRs(queue: PullRequest[]): PullRequest[] {
		const memberApprovedPRs = queue.filter((memberApprovedPR: PullRequest) => {
			return (
				memberApprovedPR.member_complete === true &&
				memberApprovedPR.lead_complete === false
			);
		});
		return memberApprovedPRs;
	}

	/**
	 * @description Filter PRs that are fully approved by members and leads
	 * @param queue A queue of PRs
	 */
	filterMergablePRs(queue: PullRequest[]): PullRequest[] {
		const mergablePRs = queue.filter((mergablePR: PullRequest) => {
			return (
				mergablePR.member_complete === true && mergablePR.lead_complete === true
			);
		});
		return mergablePRs;
	}

  /**
   * @description Filter PRs that are neither fully approved by members or leads
   * @param queue A queue of PRs 
   */
	filterNoFullyApprovedPRs(queue: PullRequest[]): PullRequest[] {
		const notFullyApprovedPRs = queue.filter(
			(notFullyApprovedPR: PullRequest) => {
				return (
					notFullyApprovedPR.member_complete === false &&
					notFullyApprovedPR.lead_complete === false
				);
			},
		);
		return notFullyApprovedPRs;
	}
}
