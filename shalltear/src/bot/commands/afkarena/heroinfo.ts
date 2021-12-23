import { Message, MessageEmbed, MessageOptions } from 'discord.js';
import { CommandData } from '../../ICommand';
import { produceCommands } from '../../services/DiscordUtils';
import { getRepository, ILike } from 'typeorm';
import { Hero, HeroClass, HeroFaction, HeroType } from '../../../entities/Hero';
import { Skill, SkillType } from '../../../entities/Skill';
import CreatePaginatedMessage from '../../../lib/CreatePaginatedMessage';
import { isArray } from 'lodash';

const BASE_URL = 'https://afktools.com/files/images/afkarena';

export default produceCommands('Heroes')(
  {
    name: 'hero',
    aliases: [],
    description: 'Display general information for the given hero.',
    guildOnly: false,
    cooldown: 3,
    usage: '<hero>',

    execute(data: CommandData) {
      displayHeroInformation(data);
    },
  },
  {
    name: 'skill',
    aliases: ['skills'],
    description: 'Display skill information for the given hero or skill.',
    guildOnly: false,
    cooldown: 3,
    usage: '<hero/skill>',

    execute(data: CommandData) {
      displaySkillInformation(data);
    },
  },
  {
    name: 'si',
    aliases: ['signature', 'sig'],
    description: 'Display signature item information for the given hero.',
    guildOnly: false,
    cooldown: 3,
    usage: '<hero>',

    execute(data: CommandData) {
      displaySkillInformation(data, SkillType.Signature);
    },
  },
  {
    name: 'fn',
    aliases: ['fi', 'furn', 'furniture'],
    description: 'Display furniture item information for the given hero.',
    guildOnly: false,
    cooldown: 3,
    usage: '<hero>',

    execute(data: CommandData) {
      displaySkillInformation(data, SkillType.Furniture);
    },
  }
);

async function searchHero(heroName: string): Promise<Hero | undefined> {
  const heroRepository = getRepository(Hero);

  const result = await heroRepository.findOne({
    relations: ['skills'],
    where: { name: heroName },
  });

  if (result) return result;

  return heroRepository.findOne({
    relations: ['skills'],
    where: [
      { name: heroName },
      { aliases: ILike(`%${heroName}%`) },
      { title: ILike(`%${heroName}%`) },
    ],
  });
}

function displaySkillInformation(
  { message, args }: CommandData,
  type: SkillType | undefined = undefined
) {
  if (args.length == 0) {
    return message.reply('Missing hero or skill name.');
  }

  const heroName = args.join(' ');

  searchHero(heroName)
    .then(hero => {
      if (hero) {
        displayHeroSkills(message, hero, type);
      } else {
        getRepository(Skill)
          .findOne({
            relations: ['hero'],
            where: [{ name: ILike(`%${heroName}%`) }],
          })
          .then(skill => {
            if (skill && (!type || skill.type === type)) {
              message.channel.send({
                embeds: [makeSkillEmbed(skill.hero, skill)],
              });
            } else {
              message.reply('Unknown hero or skill name.');
            }
          })
          .catch(console.error);
      }
    })
    .catch(console.error);
}

function displayHeroSkills(
  message: Message,
  hero: Hero,
  type: SkillType | undefined = undefined
) {
  const embeds = hero.skills
    .filter(x => !type || x.type === type)
    .map(s => makeSkillEmbed(hero, s));

  if (embeds.length === 0) {
    // should not happen
    console.error('hero.skills.filter() returned empty collection');
  } else if (embeds.length === 1) {
    message.channel.send({ embeds: embeds });
  } else {
    // pages!
    CreatePaginatedMessage(message, embeds);
  }
}

function makeSkillEmbed(hero: Hero, skill: Skill): MessageEmbed {
  const embed = new MessageEmbed();

  embed.setAuthor(
    `${hero.name}, ${hero.title}`,
    `${BASE_URL}/hero_icon/${hero.icon}`
  );
  embed.setColor('#007f7f');
  embed.setThumbnail(`${BASE_URL}/skills/${skill.icon}`);
  embed.setTitle(
    `Skill: ${skill.name}${
      skill.type === SkillType.Ultimate ? ' (Ultimate)' : ''
    }`
  );

  if (skill.type !== SkillType.Furniture)
    embed.setDescription(skill.description);

  skill.levels.forEach(level =>
    embed.addField(level.unlocksAt, level.description)
  );

  return embed;
}

function displayHeroInformation({ message, args }: CommandData) {
  if (args.length == 0) {
    return message.reply('Missing hero name.');
  }

  const heroName = args[0];

  searchHero(heroName)
    .then(hero => {
      if (hero) {
        message.channel.send({ embeds: [buildHeroEmbed(hero)] });
      } else {
        message.reply('Unknown hero.');
      }
    })
    .catch(console.error);
}

function buildHeroEmbed(hero: Hero): MessageEmbed {
  const embed = new MessageEmbed();

  embed.setTitle(`**${hero.name}**`);
  embed.setThumbnail(`${BASE_URL}/hero_icon/${hero.icon}`);
  embed.setColor('#007f7f');

  embed.addField('Title', hero.title);
  embed.addField(
    'Faction',
    `${getFactionEmoji(hero)} ${capitalize(hero.faction)}`,
    true
  );
  embed.addField(
    'Class',
    `${getClassEmoji(hero)} ${capitalize(hero.klass)}`,
    true
  );
  embed.addField(
    'Type',
    `${getTypeEmoji(hero)} ${capitalize(hero.type)}`,
    true
  );

  return embed;
}

function capitalize(text: string): string {
  const capitalizeFirstLetter = (str: string): string =>
    str.charAt(0).toUpperCase() + str.slice(1);

  return text
    .split(/'\s+'/)
    .map(x => capitalizeFirstLetter(x))
    .join(' ');
}

// EMOJIS
// <:lightbearer:868304476522561606>
// <:mauler:868304478212857886>
// <:wilder:868304478049304607>
// <:graveborn:868304475629191209>
// <:celestial:868304475742421072>
// <:hypogean:868304476195397702>
// <:dimensional:868304475717238844>
// <:warrior:868304477894098994>
// <:tank:868304477797613628>
// <:ranger:868304477873127494>
// <:mage:868304476736454686>
// <:support:868304478082826250>
// <:strength:868304477747302410>
// <:agility:868304475130040381>
// <:intelligence:868304475901808671>

function getFactionEmoji(hero: Hero) {
  switch (hero.faction) {
    case HeroFaction.Lightbearer:
      return '<:lightbearer:868304476522561606>';
    case HeroFaction.Mauler:
      return '<:mauler:868304478212857886>';
    case HeroFaction.Wilder:
      return '<:wilder:868304478049304607>';
    case HeroFaction.Graveborn:
      return '<:graveborn:868304475629191209>';
    case HeroFaction.Celestial:
      return '<:celestial:868304475742421072>';
    case HeroFaction.Hypogean:
      return '<:hypogean:868304476195397702>';
    case HeroFaction.Dimensional:
    default:
      return '<:dimensional:868304475717238844>';
  }
}

function getClassEmoji(hero: Hero) {
  switch (hero.klass) {
    case HeroClass.Warrior:
      return '<:warrior:868304477894098994>';
    case HeroClass.Tank:
      return '<:tank:868304477797613628>';
    case HeroClass.Ranger:
      return '<:ranger:868304477873127494>';
    case HeroClass.Mage:
      return '<:mage:868304476736454686>';
    case HeroClass.Support:
    default:
      return '<:support:868304478082826250>';
  }
}

function getTypeEmoji(hero: Hero) {
  switch (hero.type) {
    case HeroType.Strength:
      return '<:strength:868304477747302410>';
    case HeroType.Agility:
      return '<:agility:868304475130040381>';
    case HeroType.Intelligence:
    default:
      return '<:intelligence:868304475901808671>';
  }
}
