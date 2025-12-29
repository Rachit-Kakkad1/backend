import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * ------------------------------------------------------
 * Verify Google ID Token
 * ------------------------------------------------------
 */
export const verifyGoogleToken = async (token) => {
  if (!token || typeof token !== "string") {
    throw new Error("Invalid Google token");
  }

  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();

  if (!payload || !payload.sub) {
    throw new Error("Invalid Google token payload");
  }

  return {
    googleId: payload.sub,
    email: payload.email,
    name: payload.name,
    avatar: payload.picture || "",
  };
};
