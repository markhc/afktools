import express from 'express';
import session from 'express-session';
import passport from 'passport';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';

import routes from './routes';
import config from './config';

const MySQLStore = require('express-mysql-session')(session);

function serverListen() {
  const app = express();
  const sessionStore = new MySQLStore({
    host: config.dbHost,
    port: config.dbPort,
    user: config.dbUser,
    password: config.dbPass,
    database: config.dbName,
    connectionLimit: 5,
  });

  const sessionInfo = {
    secret: config.serverSessionSecret,
    resave: false,
    saveUninitialized: true,
    store: sessionStore,
    cookie: { secure: process.env.NODE_ENV === 'production' },
  };

  console.log(
    `Starting server instance on port ${config.serverPort}.\nSecure cookies: ${
      sessionInfo.cookie.secure ? 'yes' : 'no'
    }`
  );

  app.use(session(sessionInfo));
  app.use(morgan('combined'));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(helmet());
  app.use(cors({ origin: '*' }));
  app.use(express.json());
  app.use('/', routes);

  app.use((req, res) => {
    res.status(404).json({
      message: "Sorry, that doesn't exist.",
      code: 404,
      path: req.path,
    });
  });

  app.use((err: Error, _: express.Request, res: express.Response) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal Server Error.' });
  });

  app
    .listen(config.serverPort, () => {
      console.log(`Ready!`);
    })
    .on('error', e => {
      console.error(e);
    });
}

export { serverListen };
