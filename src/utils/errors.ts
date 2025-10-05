export class SignatureInvalidError extends Error {
	constructor() {
		super("Telegram signature is invalid");
		this.name = "SignatureInvalidError";
	}
}

export class SignatureMissingError extends Error {
	constructor(hasHash = false) {
		super(
			hasHash
				? "Telegram signature is missing"
				: "Telegram hash parameter is missing",
		);
		this.name = "SignatureMissingError";
	}
}

export class AuthDateInvalidError extends Error {
	constructor(authDate?: string) {
		super(`Telegram auth_date is invalid: ${authDate || "missing"}`);
		this.name = "AuthDateInvalidError";
	}
}

export class ExpiredError extends Error {
	constructor(authDate: Date, expiresAt: Date, now: Date) {
		super(
			`Telegram init data expired. Auth date: ${authDate.toISOString()}, expires at: ${expiresAt.toISOString()}, now: ${now.toISOString()}`,
		);
		this.name = "ExpiredError";
	}
}
