import express from 'express';
import passport from 'passport';
import { Strategy as DiscordStrategy } from 'passport-discord';
import { getRepository, Repository } from 'typeorm';
import config from '../../../config';

import { User, UserRole } from '../../../entities/User';

const router = express.Router();

const scopes = ['identify', 'email', 'guilds', 'guilds.join'];
const prompt = 'consent';
const discordOptions = {
  clientID: config.botApplicationCID,
  clientSecret: config.botApplicationSecret,
  callbackURL: config.botApplicationCallback,
  scope: scopes,
};

passport.serializeUser(function (user: any, done) {
  done(null, user.id);
});

passport.deserializeUser(async function (id: any, done) {
  const user = await getRepository(User).findOne({
    id: id,
  });

  if (user) {
    done(null, user);
  } else {
    done(new Error('No such user'));
  }
});

passport.use(
  new DiscordStrategy(
    discordOptions,
    async (accessToken, refreshToken, profile, done) => {
      // TODO: Allow multiple tokens for each user
      // so they can login from multiple devices
      const userRepository = getRepository(User);

      const user = await userRepository.findOne(profile.id);

      try {
        if (!user) {
          createNewUser(userRepository, profile, accessToken).then(u =>
            done(null, u)
          );
        } else {
          updateUser(userRepository, user, profile, accessToken).then(u =>
            done(null, u)
          );
        }
      } catch (err: any) {
        done(err);
      }
    }
  )
);

router.get('/login', (req, res, next) => {
  if (req.isAuthenticated()) return res.redirect('/');

  passport.authenticate('discord', { scope: scopes, prompt: prompt })(
    req,
    res,
    next
  );
});

router.get('/callback', (req, res, next) => {
  if (req.isAuthenticated()) return res.redirect('/');

  passport.authenticate('discord', (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      return res.redirect('/');
    }
    req.logIn(user, err => {
      if (err) return next(err);
      return res.redirect('/');
    });
  })(req, res, next);
});

router.get('/logout', (req, res) => {
  // TODO: Implement logout logic
  if (req.isAuthenticated()) req.logout();
  res.redirect('/');
});

async function createNewUser(
  userRepository: Repository<User>,
  profile: DiscordStrategy.Profile,
  accessToken: string
) {
  const user = new User();
  user.id = profile.id;
  if (user.id === config.botOwnerId) {
    user.role = UserRole.Owner;
  } else {
    user.role = UserRole.Basic;
  }

  user.avatar = profile.avatar || '';
  user.email = profile.email;
  user.name = profile.username;
  user.access_token = accessToken;

  return userRepository.save(user);
}

async function updateUser(
  userRepository: Repository<User>,
  user: User,
  profile: DiscordStrategy.Profile,
  accessToken: string
) {
  user.avatar = profile.avatar || '';
  user.email = profile.email;
  user.name = profile.username;
  user.access_token = accessToken;

  return userRepository.save(user);
}

export function isAuthenticated(
  role?: UserRole
): (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => void {
  return (req, res, next) => {
    if (req.isAuthenticated()) {
      return next();
    } else {
      res.status(401).json({ message: 'Unathorized' });
    }
  };
}

export default router;
