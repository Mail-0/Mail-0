/* eslint-disable @typescript-eslint/no-explicit-any */
import { Client } from "@microsoft/microsoft-graph-client";
import { MailManager, IConfig, UserInfo } from "../types";
import { env } from "@/lib/env";
import * as he from "he";

const microsoftDriver = async (config: IConfig): Promise<MailManager> => {
  const scope = () =>
    "https://graph.microsoft.com/User.Read https://graph.microsoft.com/Mail.ReadWrite https://graph.microsoft.com/Mail.Send offline_access";

  const getClient = (accessToken: string) => {
    return Client.initWithMiddleware({
      authProvider: {
        getAccessToken: async () => accessToken,
      },
    });
  };

  const refreshToken = async (
    refreshTokenValue: string,
  ): Promise<{ access_token: string; refresh_token: string }> => {
    const params = new URLSearchParams();
    params.append("client_id", env.MICROSOFT_CLIENT_ID as string);
    params.append("client_secret", env.MICROSOFT_CLIENT_SECRET as string);
    params.append("refresh_token", refreshTokenValue);
    params.append("redirect_uri", env.MICROSOFT_REDIRECT_URI as string);
    params.append("grant_type", "refresh_token");

    const tokenRes = await fetch("https://login.microsoftonline.com/common/oauth2/v2.0/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    if (!tokenRes.ok) {
      const errorText = await tokenRes.text();
      throw new Error(`Refresh token exchange failed: ${errorText}`);
    }

    const tokenData = await tokenRes.json();
    return {
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token || refreshTokenValue,
    };
  };

  const callGraphApi = async <T>(apiCall: (client: Client) => Promise<T>): Promise<T> => {
    try {
      if (!config.auth?.access_token || !config.auth.refresh_token) {
        throw new Error("Access token or refresh token are missing.");
      }

      const client = getClient(config.auth.access_token);
      return await apiCall(client);
    } catch (error: any) {
      if (error.statusCode === 401 || (error.message && error.message.includes("expired_token"))) {
        // Token has expired, refresh it
        try {
          const newTokens = await refreshToken(config.auth.refresh_token);
          config.auth = newTokens;
          const client = getClient(newTokens.access_token); // Use the NEW access token
          return await apiCall(client); // Retry the API call with the new token
        } catch (refreshError: any) {
          console.error("Failed to refresh token:", refreshError);
          throw new Error(`Failed to refresh token: ${refreshError.message}`);
        }
      } else {
        console.error("Graph API error:", error);
        throw error;
      }
    }
  };

  return {
    markAsRead: async (id: string) => {
      await callGraphApi(async (client) => {
        await client.api(`/me/messages/${id}`).patch({ isRead: true });
      });
    },
    getScope: scope,
    getUserInfo: async (tokens: { access_token: string; refresh_token: string }) => {
      config.auth = tokens;
      try {
        const client = getClient(tokens.access_token);
        const outlookPayload = await client.api("/me").get();

        const userInfo: UserInfo = {
          email: outlookPayload.mail || outlookPayload.userPrincipalName,
          name: outlookPayload.displayName,
          picture: null,
        };

        return userInfo;
      } catch (error: any) {
        console.error("Error fetching user info from Outlook:", error);
        throw new Error(`Failed to get user info from Outlook: ${error.message}`);
      }
    },
    getTokens: async <T>(code: string) => {
      const params = new URLSearchParams();
      params.append("client_id", env.MICROSOFT_CLIENT_ID as string);
      params.append("client_secret", env.MICROSOFT_CLIENT_SECRET as string);
      params.append("code", code);
      params.append("redirect_uri", env.MICROSOFT_REDIRECT_URI as string);
      params.append("grant_type", "authorization_code");

      const tokenRes = await fetch("https://login.microsoftonline.com/common/oauth2/v2.0/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      });
      if (!tokenRes.ok) {
        const errorText = await tokenRes.text();
        throw new Error(`Token exchange failed: ${errorText}`);
      }
      const tokenData = await tokenRes.json();
      return {
        tokens: { access_token: tokenData.access_token, refresh_token: tokenData.refresh_token },
      } as T;
    },
    generateConnectionAuthUrl: (userId: string) => {
      const params = new URLSearchParams({
        client_id: env.MICROSOFT_CLIENT_ID as string,
        response_type: "code",
        redirect_uri: env.MICROSOFT_REDIRECT_URI as string,
        response_mode: "query",
        scope: scope(),
        state: userId,
      });

      return `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${params.toString()}`;
    },
    count: async () => {
      return await callGraphApi(async (client) => {
        const inbox = await client.api("/me/mailFolders/Inbox").get();
        const junk = await client.api("/me/mailFolders/JunkEmail").get();
        return [inbox.totalItemCount, junk.totalItemCount];
      });
    },
    list: async (folder, q, maxResults = 10, _labelIds: string[] = []) => {
      // Map common folder names to Outlook folder names.
      let mailFolder = "Inbox";
      switch (folder.toLowerCase()) {
        case "trash":
          mailFolder = "DeletedItems";
          break;
        case "spam":
          mailFolder = "JunkEmail";
          break;
        case "sent":
          mailFolder = "SentItems";
          break;
        default:
          mailFolder = "Inbox";
      }

      return await callGraphApi(async (client) => {
        let request = client.api(`/me/mailFolders/${mailFolder}/messages`).top(maxResults);
        if (q) {
          request = request.search(`"${q}"`);
        }
        const data = await request.get();
        const threads = await Promise.all(
          (data.value || []).map(async (message: any) => {
            const sender = message.from?.emailAddress;
            const senderName = sender?.name || "Unknown";
            const senderEmail = `<${sender?.address}>`;

            return {
              id: message.id,
              title: message.subject || "",
              tags: [],
              sender: {
                name: senderName,
                email: senderEmail,
              },
              unread: message.isRead === false,
              receivedOn: message.receivedDateTime,
              subject: message.subject,
              body: "",
              processedHtml: "",
              blobUrl: "",
              totalReplies: 1,
            };
          }),
        );
        return { threads, ...data };
      });
    },
    get: async (id: string) => {
      return await callGraphApi(async (client) => {
        const message = await client.api(`/me/messages/${id}`).get();
        const bodyContent = message.body?.content || "";
        const decodedBody = he.decode(bodyContent);
        const sender = message.from?.emailAddress;
        const senderName = sender?.name || "Unknown";
        const senderEmail = `<${sender?.address}>`;
        const parsedData = {
          id: message.id,
          title: message.subject || "",
          tags: [],
          sender: {
            name: senderName,
            email: senderEmail,
          },
          unread: message.isRead === false,
          receivedOn: message.receivedDateTime,
          subject: message.subject,
        };
        const fullEmailData = {
          ...parsedData,
          body: message.body?.content || "",
          processedHtml: "",
          blobUrl: "",
          decodedBody,
          totalReplies: 1,
        };
        return [fullEmailData];
      });
    },
    create: async (data: any) => {
      return await callGraphApi(async (client) => {
        const res = await client.api("/me/sendMail").post({
          message: data,
          saveToSentItems: true,
        });
        return res;
      });
    },
    delete: async (id: string) => {
      return await callGraphApi(async (client) => {
        await client.api(`/me/messages/${id}`).delete();
        return { success: true };
      });
    },
  };
};

export default microsoftDriver;
