import type { Chat, InitData, TelegramUser } from "../types";

/**
 * Parses Telegram Mini App init data from a query string.
 *
 * @param initData - The init data string received from Telegram (typically from window.location.hash)
 * @returns Parsed init data object containing user info, auth date, hash, and other Telegram Mini App data
 */
export function parseInitData(initData: string): InitData {
	// Parse the query string into key-value pairs
	const params = new URLSearchParams(initData);
	const result: Partial<InitData> = {};

	// Process each parameter
	for (const [key, value] of params.entries()) {
		switch (key) {
			case "user":
			case "receiver":
				// Parse JSON strings for user objects
				try {
					result[key] = JSON.parse(decodeURIComponent(value)) as TelegramUser;
				} catch {
					result[key] = undefined;
				}
				break;
			case "chat":
				// Parse JSON strings for chat objects
				try {
					result[key] = JSON.parse(decodeURIComponent(value)) as Chat;
				} catch {
					result[key] = undefined;
				}
				break;
			case "auth_date":
				result[key] = new Date(parseInt(value, 10) * 1000);
				break;
			case "can_send_after":
				result[key] = parseInt(value, 10);
				break;
			default:
				// For all other fields, just decode and keep as string
				(result as Record<string, unknown>)[key] = decodeURIComponent(value);
				break;
		}
	}

	return result as InitData;
}
