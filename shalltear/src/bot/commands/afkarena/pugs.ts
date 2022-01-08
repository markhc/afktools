import { CommandData } from '../../ICommand';
import {
  produceCommands,
  resolveGuildMember,
} from '../../services/DiscordUtils';

import {
  BaseGuildTextChannel,
  CategoryChannel,
  Guild,
  GuildChannelCreateOptions,
  GuildMember,
  Message,
  MessageActionRow,
  MessageButton,
  MessageComponentInteraction,
  MessageEmbed,
  PermissionOverwrites,
  Permissions,
  Role,
  TextBasedChannels,
  TextChannel,
  VoiceChannel,
} from 'discord.js';
import { channel } from 'diagnostics_channel';
import { ChannelTypes } from 'discord.js/typings/enums';

const collectorFilter = {
  filter: (interaction: MessageComponentInteraction) => {
    return !interaction.user.bot;
  },
  time: 20000,
};

export default produceCommands('Hunting Fields')(
  {
    name: 'createpug',
    description: 'Creates a channel for a competitive pick-up group.',
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

      //message.delete().catch(console.error);
      sendConfirmationEmbed(
        channel as TextChannel,
        channelName,
        members,
        false
      );
    },
  },
  {
    name: 'createcasualpug',
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

      //message.delete().catch(console.error);
      sendConfirmationEmbed(channel as TextChannel, channelName, members, true);
    },
  }
);

async function sendConfirmationEmbed(
  currentChannel: TextChannel,
  channelName: string,
  members: GuildMember[],
  casual: boolean
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

      let createChannel = createPugChannel as any;

      if (casual) createChannel = createCasualPugChannel;

      createChannel(currentChannel, channelName, members)
        .then((category: any) => {
          progressMessage.edit(`Channels created. ${category}`);
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

async function createCasualPugChannel(
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

async function createPugChannel(
  currentChannel: TextChannel,
  channelName: string,
  members: GuildMember[]
): Promise<CategoryChannel> {
  const guild = currentChannel.guild;
  const everyoneRole = guild.roles.everyone;

  const teamRole = await guild.roles.create({
    name: channelName,
    mentionable: true,
  });

  let parent = null,
    announce = null,
    chat = null,
    vc = null;

  try {
    members.forEach(user => {
      user.roles.add(teamRole);
    });

    parent = await guild.channels.create(channelName, {
      type: 'GUILD_CATEGORY',
      permissionOverwrites: [
        {
          id: everyoneRole.id,
          deny: [
            Permissions.FLAGS.VIEW_CHANNEL,
            Permissions.FLAGS.SEND_MESSAGES,
          ],
        },
      ],
    });

    announce = await doCreateTextChannel(
      guild,
      `${channelName}-announce`,
      parent,
      teamRole
    );

    chat = await doCreateTextChannel(
      guild,
      `${channelName}-chat`,
      parent,
      teamRole
    );

    vc = await doCreateVoiceChannel(
      guild,
      `${channelName}-vc`,
      parent,
      teamRole
    );

    return parent;
  } catch (ex) {
    // Clean this mess up
    // if (vc) vc.delete();
    if (chat) chat.delete();
    if (announce) announce.delete();
    if (parent) parent.delete();
    if (teamRole) teamRole.delete();
    throw ex;
  }
}

async function doCreateTextChannel(
  guild: Guild,
  channelName: string,
  parent: CategoryChannel,
  teamRole: Role
): Promise<TextChannel> {
  const everyoneRole = guild.roles.everyone;

  return guild.channels.create(channelName, {
    type: 'GUILD_TEXT',
    parent: parent,
    permissionOverwrites: [
      {
        id: everyoneRole.id,
        deny: [Permissions.FLAGS.VIEW_CHANNEL, Permissions.FLAGS.SEND_MESSAGES],
      },
      {
        id: '927968174647967794', // Strategy role
        allow: [
          Permissions.FLAGS.VIEW_CHANNEL,
          Permissions.FLAGS.SEND_MESSAGES,
        ],
      },
      {
        id: '927968283280416779', // Team leader
        allow: [Permissions.FLAGS.MANAGE_MESSAGES],
      },
      {
        id: teamRole.id, // team role
        allow: [
          Permissions.FLAGS.VIEW_CHANNEL,
          Permissions.FLAGS.SEND_MESSAGES,
        ],
      },
    ],
  });
}

async function doCreateVoiceChannel(
  guild: Guild,
  channelName: string,
  parent: CategoryChannel,
  teamRole: Role
): Promise<VoiceChannel> {
  const everyoneRole = guild.roles.everyone;

  return guild.channels.create(channelName, {
    type: 'GUILD_VOICE',
    parent: parent,
    permissionOverwrites: [
      {
        id: everyoneRole.id,
        deny: [
          Permissions.FLAGS.VIEW_CHANNEL,
          Permissions.FLAGS.CONNECT,
          Permissions.FLAGS.SPEAK,
        ],
      },
      {
        id: '927968174647967794', // Strategy role
        allow: [
          Permissions.FLAGS.VIEW_CHANNEL,
          Permissions.FLAGS.CONNECT,
          Permissions.FLAGS.SPEAK,
        ],
      },
      {
        id: teamRole.id, // team role
        allow: [
          Permissions.FLAGS.VIEW_CHANNEL,
          Permissions.FLAGS.CONNECT,
          Permissions.FLAGS.SPEAK,
        ],
      },
    ],
  });
}
