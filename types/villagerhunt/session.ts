/**
 * User session information from Twitch authentication
 */
export interface Session {
  login: string;
  userId: string;
  accessToken?: string;
}
