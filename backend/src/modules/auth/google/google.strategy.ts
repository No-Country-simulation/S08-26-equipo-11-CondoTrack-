import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

import { config } from "../../../config/env.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: config.googleClientId,
      clientSecret: config.googleClientSecret,
      callbackURL: config.googleCallbackUrl,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;

        if (!email) {
          return done(null, false);
        }

        const googleUser = {
          googleId: profile.id,
          email,
          firstName: profile.name?.givenName ?? "",
          lastName: profile.name?.familyName ?? "",
        };

        return done(null, googleUser);
      } catch (error) {
        return done(error, false);
      }
    },
  ),
);