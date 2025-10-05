export const getOriginHostname = (url: string) => {
	try {
		const parsedUrl = new URL(url);
		return parsedUrl.hostname;
	} catch (_error) {
		return null;
	}
};
