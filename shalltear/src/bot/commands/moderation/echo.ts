import Discord, { Permissions, TextChannel } from 'discord.js';
import { ICommand, CommandData } from '../../ICommand';
import {
  removeCommandInvocation,
  resolveChannel,
  resolveGuildMember,
} from '../../services/DiscordUtils';
import { produceCommands } from '../../services/DiscordUtils';
import Errors from '../../services/Errors';

export default produceCommands('Moderation')({
  name: 'echo',
  description: 'Kicks a user from this server',
  guildOnly: true,
  cooldown: 5,
  usage: '[channel] <contents>',
  permissions: ['MANAGE_MESSAGES'],

  async execute({ client, guild, message, channel, args }: CommandData) {
    if (args.length == 0) {
      return message.reply('Cannot echo empty message');
    }

    try {
      const channel = await resolveChannel(guild!, args[0]);

      if (channel.isText()) {
        const rawContents = removeCommandInvocation(client, this, message);

        channel.send(rawContents.slice(args[0].length + 1));
      } else {
        message.reply('Can only echo on text channels.');
      }
    } catch (error) {
      if (error === Errors.INVALID_SNOWFLAKE) {
        const rawContents = removeCommandInvocation(client, this, message);

        message.delete().then(() => {
          channel.send(rawContents);
        });
      }
    }
  },
});
