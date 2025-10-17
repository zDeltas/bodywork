export interface FeedbackPayload {
  score: number;
  liked?: string;
  missing?: string;
  suggestion?: string;
  contact_email?: string;
  consent_contact: boolean;
  app_version: string;
  device: string;
}

export interface FeedbackResponse {
  id: string;
  message: string;
}
