import { InitialThread } from "@/types";

export interface ParsedMessage {
  id: string;
  title: string;
  tags: string[];
  sender: {
    name: string;
    email: string;
  };
  unread: boolean;
  receivedOn: string;
  subject: string;
  body: string;
  processedHtml: string;
  blobUrl: string;
  totalReplies: number;
  decodedBody?: string;
}

export interface UserInfo {
  email: string;
  name: string;
  picture: string | null;
}

export interface MailManager {
  get(id: string): Promise<ParsedMessage[] | undefined>;
  create(data: any): Promise<any>;
  delete(id: string): Promise<any>;
  list<T>(
    folder: string,
    query?: string,
    maxResults?: number,
    labelIds?: string[],
  ): Promise<(T & { threads: InitialThread[] }) | undefined>;
  count(): Promise<any>;
  generateConnectionAuthUrl(userId: string): string;
  getTokens<T>(
    code: string,
  ): Promise<T & { tokens: { access_token?: any; refresh_token?: any; expiry_date?: number } }>;
  getUserInfo(tokens: IConfig["auth"]): Promise<UserInfo>;
  getScope(): string;
  markAsRead(id: string): Promise<void>;
}

export interface IConfig {
  auth: {
    access_token: string;
    refresh_token: string;
  };
}
