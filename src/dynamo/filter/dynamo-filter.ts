import { PullRequest } from "../../models";

interface IDynamoFilter {
	filterLeadApprovedPRs(queue: PullRequest[]): PullRequest[];
	filterMemberApprovedPRs(queue: PullRequest[]): PullRequest[];
	filterMergablePRs(queue: PullRequest[]): PullRequest[];
	filterNoFullyApprovedPRs(queue: PullRequest[]): PullRequest[];
	checkMessageIds(messageIds: string[], newMessageId: string): boolean;
	addNewMessageId(messageIds: string[], newMessageId: string): string[];
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

	/**
	 * @description Check if the message ids already contains the new message id
	 * @param messageIds list of existing message ids
	 * @param newMessageId new message id
	 */
	checkMessageIds(messageIds: string[], newMessageId: string): boolean {
		const foundMessageId = messageIds.indexOf(newMessageId) > -1 ? true : false;
		return foundMessageId;
	}

	/**
	 * @description Add the new message id to the message Ids. If the existing message ids
	 * is already at the max (20), make space for the new message id
	 * @param messageIds List of message ids
	 * @param newMessageId new message id
	 */
	addNewMessageId(messageIds: string[], newMessageId: string): string[] {
		messageIds.length < 20
			? messageIds.push(newMessageId)
			: messageIds.shift() && messageIds.push(newMessageId);

		return messageIds;
	}
}
