import Discord from 'discord.js';
import { ICommand, CommandData } from '../../ICommand';
import { resolveGuildMember } from '../../services/DiscordUtils';
import { produceCommands } from '../../services/DiscordUtils';

export default produceCommands('Moderation')({
  name: 'kick',
  description: 'Kicks a user from this server',
  guildOnly: true,
  cooldown: 5,
  usage: '<member> [reason]',
  permissions: ['KICK_MEMBERS'],

  async execute({ message, args }: CommandData) {
    if (args.length == 0) {
      return message.reply('Please provide a user to kick.');
    }

    let reason: any = undefined;

    if (args.length > 1) {
      reason = args.slice(1).join(' ');
    }

    try {
      const member = await resolveGuildMember(message.guild!, args[0]);

      member.kick(reason).then(() => {
        message.channel.send(
          `Kicked ${member.user.tag} with reason "${reason}".`
        );
      });
    } catch (error: any) {
      if (error.code === Discord.Constants.APIErrors.UNKNOWN_USER) {
        return message.reply(`${args[0]} is not a valid guild member.`);
      }
      if (error.code === Discord.Constants.APIErrors.MISSING_PERMISSIONS) {
        return message.reply(
          "I don't have the required permissions to do that."
        );
      }
    }
  },
});
