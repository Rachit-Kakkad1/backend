/* --------------------------------------------------
 * Auth User (from backend toPublicProfile)
 * -------------------------------------------------- */
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  onboarded: boolean;
}

/* --------------------------------------------------
 * Auth Responses
 * -------------------------------------------------- */
export interface GoogleLoginResponse {
  success: boolean;
  token: string;
  user: AuthUser;
}

export interface CurrentUserResponse {
  success: boolean;
  user: AuthUser;
}
