import {
  DMChannel,
  Guild,
  Message,
  NewsChannel,
  PermissionString,
  TextBasedChannels,
  TextChannel,
} from 'discord.js';
import BotClient from './BotClient';

export interface CommandData {
  client: BotClient;
  guild: Guild | null;
  channel: TextBasedChannels;
  message: Message;
  args: string[];
}

export interface ICommand {
  readonly name: string;
  readonly aliases?: string[];
  readonly description: string;
  readonly usage: string;
  readonly permissions?: PermissionString[] | 'BOT_OWNER';
  readonly guildOnly?: boolean;
  readonly cooldown?: number;

  category?: string;

  execute(data: CommandData): void;
}
