import Discord, { FetchMemberOptions } from 'discord.js';
import { CommandData } from '../../ICommand';
import { produceCommands } from '../../services/DiscordUtils';

export default produceCommands('Owner')({
  name: 'dothething',
  description: 'Gracefully shuts down the bot.',
  guildOnly: true,
  cooldown: 5,
  usage: '',
  permissions: 'BOT_OWNER',

  /**
   * @param {Discord.Message} message
   */
  async execute({ guild, message }: CommandData) {},
});
