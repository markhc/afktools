require('reflect-metadata');
require('es6-shim');

import chalk from 'chalk';
import { discordConnect } from './bot';
import { databaseConnect } from './db';
import { serverListen } from './server';

console.log(`Starting... ${chalk.bold('NODE_ENV')}: "${process.env.NODE_ENV}"`);

(async () => {
  try {
    // Connect to our DB
    await databaseConnect();

    // Start the discord connection
    discordConnect();

    // Start the API
    serverListen();
  } catch (error: any) {
    console.error(chalk.red(error.message));
  }
})();
