import {
  Interaction,
  Message,
  MessageActionRow,
  MessageButton,
  MessageComponentInteraction,
  MessageEmbed,
} from 'discord.js';

export default async function CreatePaginatedMessage(
  message: Message,
  pages: MessageEmbed[]
) {
  if (pages.length === 0) return;

  const timeout = 120 * 1000;
  let page = 0;

  const row = new MessageActionRow().addComponents(
    new MessageButton()
      .setCustomId('prev')
      .setEmoji('<:prev:876485496585482240>')
      .setStyle('SECONDARY'),
    new MessageButton()
      .setCustomId('next')
      .setEmoji('<:next:876485496237350943>')
      .setStyle('SECONDARY')
  );

  const currentPage = await message.channel.send({
    embeds: [pages[page].setFooter(`Page ${page + 1} / ${pages.length}`)],
    components: [row],
  });

  const collector = currentPage.createMessageComponentCollector({
    filter: (interaction: MessageComponentInteraction) => {
      return !interaction.user.bot;
    },
    time: timeout,
  });

  collector.on('collect', async (interaction: MessageComponentInteraction) => {
    if (interaction.customId === 'prev') {
      page = page > 0 ? --page : pages.length - 1;
    } else {
      page = page + 1 < pages.length ? ++page : 0;
    }

    interaction.update({
      embeds: [pages[page].setFooter(`Page ${page + 1} / ${pages.length}`)],
      components: [row],
    });
  });

  collector.on('end', () => {
    if (!currentPage.deleted) {
      const row = new MessageActionRow().addComponents(
        new MessageButton()
          .setCustomId('prev')
          .setEmoji('<:prev:876485496585482240>')
          .setStyle('SECONDARY')
          .setDisabled(true),
        new MessageButton()
          .setCustomId('next')
          .setEmoji('<:next:876485496237350943>')
          .setStyle('SECONDARY')
          .setDisabled(true)
      );

      currentPage.edit({
        embeds: [pages[page].setFooter(`Page ${page + 1} / ${pages.length}`)],
        components: [row],
      });
    }
  });

  return currentPage;
}
