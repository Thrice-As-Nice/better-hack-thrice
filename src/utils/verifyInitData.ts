import crypto from "node:crypto";

export function verifyTelegramInitData(initData: string, botToken: string) {
	const parsed = new URLSearchParams(initData);
	const hash = parsed.get("hash");
	parsed.delete("hash");

	const dataCheckString = Array.from(parsed.entries())
		.sort(([a], [b]) => a.localeCompare(b))
		.map(([k, v]) => `${k}=${v}`)
		.join("\n");

	const secretKey = crypto
		.createHmac("sha256", "WebAppData")
		.update(botToken)
		.digest();
	const calculatedHash = crypto
		.createHmac("sha256", secretKey)
		.update(dataCheckString)
		.digest("hex");

	if (calculatedHash !== hash) throw new Error("Invalid Telegram signature");

	const user = JSON.parse(parsed.get("user") ?? "{}");

	return user;
}
