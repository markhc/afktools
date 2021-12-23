import { CommandData } from '../../ICommand';
import { produceCommands } from '../../services/DiscordUtils';
import {
  AFKHelperGetCampaignSolution,
  AFKHelperGetTowerSolution,
  Towers,
} from '../../services/AFKHelper';

export default produceCommands('AFKHelper')(
  {
    name: 'campaign',
    description: 'Gets one or more campaign clears',
    guildOnly: true,
    cooldown: 3,
    usage: '<stage> [count]',

    execute({ message, args }: CommandData) {
      if (args.length == 0) {
        return message.reply(
          'Please provide the stage you want to see clears for. e.g `.campaign 37-4`'
        );
      }

      const stageInfo = args[0].split('-');

      if (stageInfo.length != 2) {
        return message.reply('Invalid arguments.');
      }

      const chapter = parseInt(stageInfo[0]);
      const stage = parseInt(stageInfo[1]);

      if (chapter == NaN || stage == NaN)
        return message.reply('Invalid arguments.');

      if (args.length > 1) {
        const count = parseInt(args[1]);

        if (count == NaN) return message.reply('Invalid arguments.');

        message.channel.send('Working...').then(msg => {
          AFKHelperGetCampaignSolution(chapter, stage, count).then(result =>
            msg.edit(result.join('\n'))
          );
        });
      } else {
        message.channel.send('Working...').then(msg => {
          AFKHelperGetCampaignSolution(chapter, stage, 1).then(result =>
            msg.edit(result.join('\n'))
          );
        });
      }
    },
  },
  {
    name: 'kt',
    aliases: ['tower', 'kingstower'],
    description: 'Gets one or more Kings Tower clears',
    guildOnly: true,
    cooldown: 3,
    usage: '<floor> [count]',

    execute(data: CommandData) {
      if (data.args.length == 0) {
        return data.message.reply(
          'Please provide the floor you want to see clears for. e.g `.kt 550`'
        );
      }

      handleTowers(data, Towers.Kings);
    },
  },
  {
    name: 'lb',
    aliases: ['lightbearer', 'light'],
    description: 'Gets one or more Tower of Light clears',
    guildOnly: true,
    cooldown: 3,
    usage: '<floor> [count]',

    execute(data: CommandData) {
      if (data.args.length == 0) {
        return data.message.reply(
          'Please provide the floor you want to see clears for. e.g `.lb 550`'
        );
      }

      handleTowers(data, Towers.Lightbearer);
    },
  },
  {
    name: 'mauler',
    aliases: ['brutal'],
    description: 'Gets one or more Brutal Citadel clears',
    guildOnly: true,
    cooldown: 3,
    usage: '<floor> [count]',

    execute(data: CommandData) {
      if (data.args.length == 0) {
        return data.message.reply(
          'Please provide the floor you want to see clears for. e.g `.mauler 550`'
        );
      }

      handleTowers(data, Towers.Mauler);
    },
  },
  {
    name: 'wilder',
    description: 'Gets one or more World Tree clears',
    guildOnly: true,
    cooldown: 3,
    usage: '<floor> [count]',

    execute(data: CommandData) {
      if (data.args.length == 0) {
        return data.message.reply(
          'Please provide the floor you want to see clears for. e.g `.wilder 550`'
        );
      }

      handleTowers(data, Towers.Wilder);
    },
  },
  {
    name: 'gb',
    aliases: ['graveborn'],
    description: 'Gets one or more Forsaken Necropolis clears',
    guildOnly: true,
    cooldown: 3,
    usage: '<floor> [count]',

    execute(data: CommandData) {
      if (data.args.length == 0) {
        return data.message.reply(
          'Please provide the floor you want to see clears for. e.g `.gb 550`'
        );
      }

      handleTowers(data, Towers.Graveborn);
    },
  },
  {
    name: 'cele',
    aliases: ['celestial'],
    description: 'Gets one or more Celestial Sanctum clears',
    guildOnly: true,
    cooldown: 3,
    usage: '<floor> [count]',

    execute(data: CommandData) {
      if (data.args.length == 0) {
        return data.message.reply(
          'Please provide the floor you want to see clears for. e.g `.cele 550`'
        );
      }

      handleTowers(data, Towers.Celestial);
    },
  },
  {
    name: 'hypo',
    aliases: ['hypogean'],
    description: 'Gets one or more Infernal Fortress clears',
    guildOnly: true,
    cooldown: 3,
    usage: '<floor> [count]',

    execute(data: CommandData) {
      if (data.args.length == 0) {
        return data.message.reply(
          'Please provide the floor you want to see clears for. e.g `.hypo 550`'
        );
      }

      handleTowers(data, Towers.Hypogean);
    },
  }
);

function handleTowers({ message, args }: CommandData, tower: Towers) {
  const floor = parseInt(args[0]);

  if (floor == NaN) return message.reply('Invalid arguments.');

  if (args.length > 1) {
    const count = parseInt(args[1]);

    if (count == NaN) return message.reply('Invalid arguments.');

    message.channel.send('Working...').then(msg => {
      AFKHelperGetTowerSolution(tower, floor, count).then(result =>
        msg.edit(result.join('\n'))
      );
    });
  } else {
    message.channel.send('Working...').then(msg => {
      AFKHelperGetTowerSolution(tower, floor, 1).then(result =>
        msg.edit(result.join('\n'))
      );
    });
  }
}
