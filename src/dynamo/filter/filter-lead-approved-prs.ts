import { PullRequest } from "../../models";

export function filterLeadApprovedPRs(queue: PullRequest[]): PullRequest[] {
	const leadApprovedPRs = queue.filter((leadApprovedPR: PullRequest) => {
		return (
			leadApprovedPR.member_complete === false &&
			leadApprovedPR.lead_complete === true
		);
	});
	return leadApprovedPRs;
}
