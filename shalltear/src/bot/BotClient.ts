import Discord, { ClientOptions } from 'discord.js';
import glob from 'glob';
import { ICommand } from './ICommand';

export default class BotClient {
  /**
   * @type {Discord.Client} client Discord client
   */
  discord: Discord.Client;
  colorScheme: Discord.ColorResolvable;
  prefix: string;
  cooldowns: Map<string, Map<string, number>>;
  commands: Map<string, ICommand>;

  /**
   * @param {ClientOptions} options Client options
   */
  constructor(options: ClientOptions) {
    this.discord = new Discord.Client(options);
    this.commands = new Map<string, ICommand>();
    this.cooldowns = new Map<string, Map<string, number>>();
    this.prefix = '.';
    this.colorScheme = '#007f7f';

    this.parseCommands();
    this.parseListeners();
  }

  parseCommands() {
    glob(
      `{./commands/**/*.js,./commands/**/*.ts}`,
      { cwd: __dirname },
      (er, files) => {
        if (!er) {
          files.forEach(file => {
            const module = require(file);
            const commands = module.default as ICommand[];
            commands.forEach(cmd => {
              if (this.commands.has(cmd.name)) {
                console.error(`Found duplicate commands: ${cmd.name}`);
                process.abort();
              }
              this.commands.set(cmd.name, cmd);
            });
          });
        }
      }
    );
  }

  parseListeners() {
    glob(
      `{./listeners/**/*.js,./listeners/**/*.ts}`,
      { cwd: __dirname },
      (er, files) => {
        if (!er) {
          files.forEach(file => {
            const listener = require(file).default;

            this.discord.on(listener.listen, (...args: any) => {
              listener.execute(this, ...args);
            });
          });
        }
      }
    );
  }

  /**
   * @param {string} token
   */
  login(token: string): Promise<string> {
    return this.discord.login(token);
  }
}

process.on('unhandledRejection', (error: Error) => {
  console.error('Unhandled promise rejection:', error);
});
