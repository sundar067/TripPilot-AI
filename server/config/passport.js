import dotenv from "dotenv";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

import User from "../models/user.js";

dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },

    async (accessToken, refreshToken, profile, done) => {
      try {
        const googleId = profile.id;
        const name = profile.displayName;
        const email = profile.emails?.[0]?.value;
        const avatar = profile.photos?.[0]?.value || "";

        // Check if Google account already exists
        let user = await User.findOne({ googleId });

        if (user) {
          if (user.isBlocked) {
            return done(null, false, {
              message:
                "Your account has been blocked. Please contact the administrator.",
            });
          }

          user.lastLogin = new Date();
          await user.save();

          return done(null, user);
        }

        // Check if email already exists
        user = await User.findOne({ email });

        if (user) {
          if (user.isBlocked) {
            return done(null, false, {
              message:
                "Your account has been blocked. Please contact the administrator.",
            });
          }

          user.googleId = googleId;
          user.avatar = avatar;
          user.isEmailVerified = true;
          user.lastLogin = new Date();

          await user.save();

          return done(null, user);
        }

        // Create new Google user
        user = await User.create({
          name,
          email,
          googleId,
          avatar,
          provider: "google",
          isEmailVerified: true,
          lastLogin: new Date(),
        });

        return done(null, user);
      } catch (error) {
        console.log("GOOGLE AUTH ERROR:", error);

        return done(error, null);
      }
    },
  ),
);

export default passport;
