export interface EmailData {
  id: string;
  subject: string;
  from: string;
  date: string;
  snippet: string;
  labels?: Array<{
    id: string;
    name: string;
  }>;
}

export interface EmailStats {
  totalEmails: number;
  topSenders: Array<[string, number]>;
  commonSubjects: string[];
  timeOfDay: {
    morning: number;
    afternoon: number;
    evening: number;
  };
  suspiciousEmails: Array<{
    subject: string;
    from: string;
    reason: string;
  }>;
  unreadCount: number;
}
