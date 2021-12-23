import Discord, { ColorResolvable, PermissionString } from 'discord.js';
import groupBy from 'lodash/groupBy';
import BotClient from '../../BotClient';
import { CommandData, ICommand } from '../../ICommand';
import { produceCommands } from '../../services/DiscordUtils';
import config from '../../../config';

export default produceCommands('Information')({
  name: 'help',
  description: 'Displays help information for the bot or a specific command',
  guildOnly: false,
  usage: '[command]',

  execute({ client, message, args }: CommandData) {
    if (args.length == 0) {
      message.channel.send({
        embeds: [buidHelpEmbed(client, message.guild, message.author)],
      });
    } else {
      const cmd = client.commands.get(args[0]);
      if (cmd) {
        message.channel.send({
          embeds: [buidHelpEmbedForCommand(client, cmd)],
        });
      } else {
        message.reply(`Command not found: "${args[0]}"`);
      }
    }
  },
});

function buidHelpEmbed(
  client: BotClient,
  guild: Discord.Guild | null,
  author: Discord.User
) {
  const member = guild?.members.resolve(author);
  const embed = new Discord.MessageEmbed();

  embed.setTitle('Help Information');
  embed.setDescription(
    `For more information try \`${client.prefix}help <command>\` for more information`
  );
  embed.setColor(client.colorScheme);

  const categories = groupBy(
    Array.from(client.commands.values()),
    x => x.category
  );

  for (const category in categories) {
    const value = categories[category];

    let commandList = '';

    value.forEach(cmd => {
      if (cmd.permissions?.length) {
        if (author.id == config.botOwnerId) {
          commandList = commandList + `${client.prefix}${cmd.name}\n`;
          return;
        }

        if (cmd.permissions === 'BOT_OWNER') return;
        if (!member) return;
        if (!member.permissions.has(cmd.permissions)) return;
      }

      commandList = commandList + `${client.prefix}${cmd.name}\n`;
    });

    if (commandList.length > 0)
      embed.addField(category, `\`\`\`css\n${commandList}\`\`\``, true);
  }

  return embed;
}

function buidHelpEmbedForCommand(
  client: BotClient,
  command: ICommand
): Discord.MessageEmbed {
  const embed = new Discord.MessageEmbed();

  embed.setTitle(command.name);
  embed.setDescription(command.description);
  embed.setColor(client.colorScheme);

  if (command.permissions && command.permissions !== 'BOT_OWNER') {
    embed.addField(
      'Permissions',
      `\`\`\`${command.permissions.join('\n')}\`\`\``
    );
  }

  if (command.cooldown) {
    embed.addField('Cooldown', `\`\`\`${command.cooldown} seconds\`\`\``);
  }

  embed.addField(
    'Usage',
    `\`\`\`${client.prefix}${command.name} ${command.usage}\`\`\``
  );

  return embed;
}
