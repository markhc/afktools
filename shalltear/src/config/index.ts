type Config = {
  botToken: string;
  botOwnerId: string;
  botPrefix: string;
  botApplicationCID: string;
  botApplicationSecret: string;
  botApplicationCallback: string;

  serverPort: number;
  serverSessionSecret: string;

  dbHost: string;
  dbPort: number;
  dbUser: string;
  dbPass: string;
  dbName: string;
};

import config from './config.json';

export default config as Config;
