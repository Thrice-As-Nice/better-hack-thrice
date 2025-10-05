export function getTelegramInitData(): string | null {
	if (typeof window === "undefined") return null;

	// The hash format from Telegram is: #tgWebAppData=<url-encoded-init-data>&tgWebAppVersion=...
	const hash = window.location.hash;
	if (hash.startsWith("#tgWebAppData=")) {
		// Extract just the tgWebAppData parameter
		const hashContent = hash.substring(1); // Remove the #
		const params = new URLSearchParams(hashContent);
		const initData = params.get("tgWebAppData");

		if (initData) {
			// Return the URL-decoded init data string (not parsed, backend will parse it)
			const decoded = decodeURIComponent(initData);
			console.log("Sending init data to backend:", decoded);
			return decoded;
		}
	}

	return null;
}
