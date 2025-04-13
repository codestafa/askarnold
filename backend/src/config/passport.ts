import passport, { Profile } from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth2';
import { saveOrFetchUser } from './db';
import { Request } from 'express';

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  callbackURL: 'http://localhost:8000/auth/google/callback',
  passReqToCallback: true,
}, async (
  req: Request,
  accessToken: string,
  refreshToken: string,
  profile: Profile,
  done: (error: any, user?: Express.User | false | null) => void
) => {
  const user = await saveOrFetchUser(profile);
  return done(null, user);
}));

passport.serializeUser((user: any, done) => {
  done(null, user);
});

passport.deserializeUser((user: any, done) => {
  done(null, user);
});