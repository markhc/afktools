import { CommandData } from '../../ICommand';
import {
  produceCommands,
  resolveGuildMember,
} from '../../services/DiscordUtils';

import {
  BaseGuildTextChannel,
  CategoryChannel,
  Guild,
  GuildMember,
  Message,
  MessageActionRow,
  MessageButton,
  MessageComponentInteraction,
  MessageEmbed,
  PermissionOverwrites,
  Permissions,
  TextBasedChannels,
  TextChannel,
} from 'discord.js';
import { InteractionTypes } from 'discord.js/typings/enums';

const collectorFilter = {
  filter: (interaction: MessageComponentInteraction) => {
    return !interaction.user.bot;
  },
  time: 20000,
};

export default produceCommands('Hunting Fields')({
  name: 'createpug',
  description: 'Creates a channel for a pick-up group',
  guildOnly: true,
  cooldown: 3,
  usage: '<name> <members...>',
  permissions: ['MANAGE_CHANNELS'],

  async execute({ message, args, guild, channel }: CommandData) {
    if (args.length < 2) {
      return message.reply(
        'Please provide the name for the group and the members'
      );
    }

    let channelName = args[0];
    let members: GuildMember[] = [];

    for (let i = 1; i < args.length; i++) {
      try {
        const guildMember = await resolveGuildMember(guild!, args[i]);

        members.push(guildMember);
      } catch (err) {
        message.reply(`Could not resolve member "${args[i]}"`);
        return;
      }
    }

    message.delete().catch(console.error);
    sendConfirmationEmbed(channel as TextChannel, channelName, members);
  },
});

async function sendConfirmationEmbed(
  currentChannel: TextChannel,
  channelName: string,
  members: GuildMember[]
) {
  const embed = new MessageEmbed();

  embed.setColor('#007f7f');
  embed.setTitle('Are you sure?');
  embed.setDescription(
    'Do you want to create a channel for this group?\n\nPressing "Yes" will create a private channel and add the given members to it.'
  );

  embed.addField('Channel Name', channelName);
  embed.addField('Members', `${members.join('\n')}`);

  const row = new MessageActionRow().addComponents(
    new MessageButton().setCustomId('yes').setLabel('YES').setStyle('SUCCESS'),
    new MessageButton().setCustomId('no').setLabel('NO').setStyle('DANGER')
  );

  const confirmationMessage = await currentChannel.send({
    embeds: [embed],
    components: [row],
  });

  const collector =
    confirmationMessage.createMessageComponentCollector(collectorFilter);

  collector.on('collect', async (interaction: MessageComponentInteraction) => {
    if (interaction.customId === 'yes') {
      confirmationMessage.delete();

      const progressMessage = await currentChannel.send('Creating channel...');

      createPugChannel(currentChannel, channelName, members)
        .then(newChannel => {
          progressMessage.edit(`Channel created: ${newChannel}`);
        })
        .catch(() => {
          progressMessage.edit(`Failed to create channel.`);
        });
    } else {
      currentChannel.send('Aborted.').then(() => {
        confirmationMessage.delete();
      });
    }
  });

  collector.on('end', () => {
    confirmationMessage.delete().catch(() => {});
  });
}

async function createPugChannel(
  currentChannel: TextChannel,
  channelName: string,
  members: GuildMember[]
): Promise<TextChannel> {
  const guild = currentChannel.guild;
  const parent = currentChannel.parent || undefined;
  const everyoneRole = guild.roles.everyone;

  return guild.channels.create(channelName, {
    type: 'GUILD_TEXT',
    parent: parent,
    permissionOverwrites: [
      {
        id: everyoneRole.id,
        deny: [Permissions.FLAGS.VIEW_CHANNEL],
      },
      {
        id: '720391291594211409', // Manager role
        allow: [Permissions.FLAGS.VIEW_CHANNEL],
      },
      ...members.map(x => ({
        id: x.id,
        allow: [
          Permissions.FLAGS.VIEW_CHANNEL,
          Permissions.FLAGS.SEND_MESSAGES,
          Permissions.FLAGS.READ_MESSAGE_HISTORY,
        ],
      })),
    ],
  });
}
