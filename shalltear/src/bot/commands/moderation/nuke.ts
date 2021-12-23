import Discord, { GuildChannelResolvable } from 'discord.js';
import { CommandData } from '../../ICommand';
import Errors from '../../services/Errors';
import { channelDeleteRecentMessages } from '../../services/Moderation';
import {
  produceCommands,
  resolveChannel,
  handleDiscordError,
  parseSnowflake,
} from '../../services/DiscordUtils';

export default produceCommands('Moderation')({
  name: 'nuke',
  description:
    'Delete N messages in the given channel. Defaults to the invoked channel.',
  guildOnly: true,
  cooldown: 5,
  usage: '[channel] <count>',
  permissions: ['MANAGE_MESSAGES'],

  execute({ guild, message, args }: CommandData) {
    if (args.length == 0) {
      return message.reply('Please provide the number of messages to remove');
    }

    const countString = args.length > 1 ? args[1] : args[0];
    const channel = args.length > 1 ? parseSnowflake(args[0]) : message.channel;
    let count = parseInt(countString);

    if (count == NaN)
      return message.reply(`"${countString}" is not a valid number.`);

    if (count > 100)
      return message.reply(`Cannot delete more than 100 messages.`);

    resolveChannel(guild!, channel as GuildChannelResolvable)
      .then(channel => {
        if (channel.id == message.channel.id) count = count + 1;

        return channelDeleteRecentMessages(channel, count);
      })
      .catch((error: Error) => {
        if (error instanceof Discord.DiscordAPIError) {
          handleDiscordError(message, error);
        } else if (error == Errors.INVALID_SNOWFLAKE)
          message.reply(`Invalid channel ID`);
        else console.error(error);
      });
  },
});
