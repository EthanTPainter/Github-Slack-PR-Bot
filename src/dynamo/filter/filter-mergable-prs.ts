import { PullRequest } from "../../models";

/**
 * @description Filter PRs that are currently mergable
 * @param queue Queue containing all known PRs
 * @returns array of PRs that are available to merge
 */
export function filterMergablePRs(queue: PullRequest[]): PullRequest[] {
	const mergablePRs = queue.filter((mergablePR: PullRequest) => {
		return (
			mergablePR.member_complete === true && mergablePR.lead_complete === true
		);
	});
	return mergablePRs;
}
