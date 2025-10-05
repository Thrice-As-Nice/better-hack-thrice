import type { BetterAuthClientPlugin } from "better-auth";
import type { telegramMiniAppAuth } from "./index";

type TelegramMiniAppPlugin = typeof telegramMiniAppAuth;

export const betterAuthTgMiniAppClientPlugin = () => {
	return {
		id: "tg-mini-auth",
		$InferServerPlugin: {} as ReturnType<TelegramMiniAppPlugin>,
		pathMethods: {
			"/sign-in/telegram-mini-app": "POST",
		},
	} satisfies BetterAuthClientPlugin;
};
