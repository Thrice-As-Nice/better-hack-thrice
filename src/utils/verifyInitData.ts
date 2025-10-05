import crypto from "node:crypto";
import type { TelegramUser, TelegramValidationOptions } from "../types";
import {
	AuthDateInvalidError,
	ExpiredError,
	SignatureInvalidError,
	SignatureMissingError,
} from "./errors";
import { parseInitData } from "./parseInitData";

function signData(data: string, token: string): string {
	const secretKey = crypto
		.createHmac("sha256", "WebAppData")
		.update(token)
		.digest();

	return crypto.createHmac("sha256", secretKey).update(data).digest("hex");
}

function validateInitData(
	initData: string,
	token: string,
	options: TelegramValidationOptions = {},
): never | undefined {
	const parsed = parseInitData(initData);

	if (!parsed.hash) {
		throw new SignatureMissingError(false);
	}

	if (!parsed.auth_date) {
		throw new AuthDateInvalidError();
	}

	const { expiresIn = 86400 } = options;
	if (expiresIn > 0) {
		const expiresAtTs = parsed.auth_date.getTime() + expiresIn * 1000;
		const nowTs = Date.now();
		if (expiresAtTs < nowTs) {
			throw new ExpiredError(
				parsed.auth_date,
				new Date(expiresAtTs),
				new Date(nowTs),
			);
		}
	}

	const params = new URLSearchParams(initData);
	params.delete("hash");

	const pairs: string[] = [];
	params.forEach((value, key) => {
		pairs.push(`${key}=${value}`);
	});
	pairs.sort();

	const dataCheckString = pairs.join("\n");
	const calculatedHash = signData(dataCheckString, token);

	if (calculatedHash !== parsed.hash) {
		throw new SignatureInvalidError();
	}
}

export function verifyTelegramInitData(
	initData: string,
	botToken: string,
	options?: TelegramValidationOptions,
): TelegramUser {
	validateInitData(initData, botToken, options);

	const parsed = parseInitData(initData);

	if (!parsed.user) {
		throw new Error("User data is missing from Telegram init data");
	}

	return parsed.user as TelegramUser;
}
