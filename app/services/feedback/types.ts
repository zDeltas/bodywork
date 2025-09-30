export type FeedbackPayload = {
  id?: string; // uuid (optional, server can generate)
  created_at?: string; // timestamp (optional, server can generate)
  app_version?: string;
  device?: string;
  score: number; // 0..10
  liked?: string;
  missing?: string;
  suggestion?: string;
  contact_email?: string;
  consent_contact: boolean;
};
