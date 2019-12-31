/**
 * @description Returns the name of the repository
 * @param event Github Event from GitHub webhook
 */
export function getRepositoryName(event: any): string {
	if (!event) {
		throw new Error(`event is undefined`);
	}
	if (!event.repository) {
		throw new Error(`event.repository is undefined`);
	}
	if (!event.repository.name) {
		throw new Error(`event.repository.name is undefined`);
	}
	const repositoryName = event.repository.name;
	return repositoryName;
}
