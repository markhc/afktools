import Discord, {
  Constants,
  DMChannel,
  GuildChannel,
  NewsChannel,
  PermissionResolvable,
  ThreadChannel,
} from 'discord.js';
import BotClient from '../BotClient';
import { ICommand, CommandData } from '../ICommand';
import { resolveGuildMember } from '../services/DiscordUtils';

export default {
  listen: 'messageCreate',

  /**
   * @param {Discord.Message} message
   */
  async execute(client: BotClient, message: Discord.Message) {
    const { channel, author, content } = message;
    const prefix = client.prefix;

    if (author.bot) return;
    if (!content.startsWith(prefix)) return;

    const parsedCmd = parseCommandInvocation(client, message);

    if (!parsedCmd) return;

    const [command, commandData] = parsedCmd;

    if (command.guildOnly && channel.type === 'DM') {
      return channel.send('This command is not available through DMs.');
    }

    try {
      const hasPermissions = await checkPermissions(
        command,
        message.guild,
        message.channel,
        message.author
      );
      const hasCooldown = await checkCooldown(client, command, message.author);

      if (!hasPermissions) {
        return message.reply(
          'You do not have the required permissions to perform this action.'
        );
      }

      if (hasCooldown) {
        return message.reply(
          `You're doing that too fast! Cooldown: ${hasCooldown}s`
        );
      }

      command.execute(commandData);
    } catch (error) {
      console.error(error);
    }
  },
};

async function checkPermissions(
  command: ICommand,
  guild: Discord.Guild | null,
  channel: Discord.TextBasedChannels,
  author: Discord.User
): Promise<boolean> {
  if (!command?.permissions) {
    return true;
  }

  if (command.permissions === 'BOT_OWNER') {
    return author.id === '210017247048105985';
  }

  if (guild) {
    try {
      const member = await resolveGuildMember(guild, author.id);

      if (channel instanceof GuildChannel || channel instanceof ThreadChannel) {
        return member.permissionsIn(channel).has(command.permissions);
      } else if (channel instanceof DMChannel) {
        //
        // All public commands are available in DMs
        //
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  return true;
}

function parseCommandInvocation(
  client: BotClient,
  message: Discord.Message
): [ICommand, CommandData] | null {
  const args = message.content.slice(client.prefix.length).trim().split(/ +/);

  if (args.length == 0) return null;

  const commandName = args.shift()!.toLowerCase();

  for (let [key, command] of client.commands) {
    if (
      command?.name.toLowerCase() === commandName ||
      command?.aliases?.map(x => x.toLowerCase()).includes(commandName)
    ) {
      return [
        command,
        {
          client,
          guild: message.guild,
          channel: message.channel,
          message,
          args,
        },
      ];
    }
  }

  return null;
}

async function checkCooldown(
  client: BotClient,
  command: ICommand,
  user: Discord.User
): Promise<number> {
  if (!command.cooldown) return 0;

  if (!client.cooldowns.has(command.name)) {
    client.cooldowns.set(command.name, new Map<string, number>());
  }

  const now = Date.now();
  const timestamps = client.cooldowns.get(command.name)!;
  const cooldownAmount = command.cooldown! * 1000;

  if (timestamps.has(user.id)) {
    const expirationTime = timestamps.get(user.id)! + cooldownAmount;

    if (now < expirationTime) {
      return (expirationTime - now) / 1000;
    }
  }

  timestamps.set(user.id, now);

  setTimeout(() => timestamps.delete(user.id), cooldownAmount);

  return 0;
}
