import {
  Guild,
  GuildMember,
  Message,
  Snowflake,
  SnowflakeUtil,
  GuildChannel,
  DiscordAPIError,
  Constants,
  GuildChannelResolvable,
  GuildMemberResolvable,
  ThreadChannel,
} from 'discord.js';
import BotClient from '../BotClient';
import Errors from './Errors';
import { ICommand } from '../ICommand';

export function produceCommands(
  category: string
): (...commands: ICommand[]) => ICommand[] {
  return function (...commands: ICommand[]) {
    commands.forEach(value => {
      value.category = category;
    });

    return commands;
  };
}

export function removeCommandInvocation(
  client: BotClient,
  command: ICommand,
  message: Message
) {
  const prefix = client.prefix;
  const commandName = command.name;

  let content = message.content.trim();

  while (content.startsWith(prefix)) content = content.substring(1);

  if (content.startsWith(commandName))
    content = content.substring(commandName.length);

  return content;
}

export function parseSnowflake(snowflake: string): Snowflake {
  if (snowflake.startsWith('<')) {
    snowflake = snowflake.replace(/[^0-9]/g, '');
  }
  return snowflake;
}

export async function resolveGuildMember(
  guild: Guild,
  guildMember: GuildMemberResolvable
): Promise<GuildMember> {
  if (typeof guildMember === 'string') {
    guildMember = parseSnowflake(guildMember);
  }

  return guild.members.fetch(guildMember);
}

export async function resolveChannel(
  guild: Guild,
  guildChannel: GuildChannelResolvable
): Promise<GuildChannel | ThreadChannel> {
  if (typeof guildChannel === 'string') {
    guildChannel = parseSnowflake(guildChannel);
  }

  const channel = guild.channels.resolve(guildChannel);

  if (channel) {
    return channel;
  } else {
    throw Errors.INVALID_SNOWFLAKE;
  }
}

export function handleDiscordError(message: Message, error: DiscordAPIError) {
  if (error.code == Constants.APIErrors.MISSING_PERMISSIONS)
    return message.reply('I am missing the required permissions for that.');
}
