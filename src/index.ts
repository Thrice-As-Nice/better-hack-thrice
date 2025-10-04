import { createAuthEndpoint } from "better-auth/plugins";
import { setSessionCookie } from "better-auth/cookies";
import * as z from "zod";
import type { BetterAuthPlugin } from "better-auth";
import { verifyTelegramInitData } from "../utils/verfiy";
import type { User } from "better-auth/types";

function getOriginHostname(url: string) {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.hostname;
  } catch (error) {
    return null;
  }
}
export interface TelegramMiniAppOptions {
  botToken: string;
  schema?: any;
}

export interface TelegramUserData extends User {
  telegramId: string;
  username: string;
  photo_url: string;
  is_premium: boolean;
}

export const telegramMiniAppAuth = (
  options: TelegramMiniAppOptions
): BetterAuthPlugin => {
  return {
    id: "telegram-mini-app",
    endpoints: {
      authenticate: createAuthEndpoint(
        "/auth/telegram-mini-app",
        {
          method: "POST",
          body: z.object({
            initData: z.string().min(1),
          }),
          metadata: {
            openapi: {
              summary: "Authenticate Telegram Mini App",
              description:
                "Verifies Telegram Mini App initData and signs in or creates a user automatically.",
              responses: {
                200: {
                  description: "User authenticated successfully",
                },
              },
            },
          },
        },
        async (ctx) => {
          const { initData } = ctx.body;
          const { botToken } = options;

          const userData = verifyTelegramInitData(initData, botToken);
          const domain = getOriginHostname(ctx.context.baseURL);
          const userEmail = `telegram-${userData.id}@${domain}`;

          let user = await ctx.context.adapter.findOne<TelegramUserData>({
            model: "user",
            where: [{ field: "telegramId", value: userData.id.toString() }],
          });

          if (!user) {
            user = await ctx.context.internalAdapter.createUser(
              {
                telegramId: userData.id.toString(),
                name: `${userData.first_name} ${
                  userData.last_name || ""
                }`.trim(),
                email: userEmail,
                emailVerified: false,
                createdAt: new Date(),
                updatedAt: new Date(),
                username: userData.username,
                photoUrl: userData.photo_url,
                isPremium: userData.is_premium || false,
              },
              ctx
            );
          }

          const newSession = await ctx.context.internalAdapter.createSession(
            user.id,
            ctx,
            false,
            ctx.context.session?.session
          );

          await setSessionCookie(ctx, {
            session: newSession,
            user,
          });

          return ctx.json({
            user,
            session: newSession,
          });
        }
      ),
    },

    schema: {
      user: {
        fields: {
          telegramId: { type: "string", unique: true },
          isPremium: { type: "boolean", required: false },
          firstName: { type: "string", required: true },
          lastName: { type: "string", required: false },
          username: { type: "string", required: false },
          photoUrl: { type: "string", required: false },
        },
      },
    },
  };
};
