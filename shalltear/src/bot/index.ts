import config from '../config';
import BotClient from './BotClient';

const _client = new BotClient({
  intents: [
    'GUILDS',
    'GUILD_MEMBERS',
    'GUILD_MESSAGES',
    'GUILD_PRESENCES',
    'DIRECT_MESSAGES',
  ],
  partials: ['CHANNEL'],
});

function discordConnect(): Promise<string> {
  return _client.login(config.botToken);
}

function client(): BotClient {
  return _client;
}

export { discordConnect, client };
