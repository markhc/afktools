import { Entity, hasMany, model, property } from '@loopback/repository';
import { Skill } from '.';

export enum HeroFaction {
  Lightbearer = 'lightbearer',
  Mauler = 'mauler',
  Wilder = 'wilder',
  Graveborn = 'graveborn',
  Celestial = 'celestial',
  Hypogean = 'hypogean',
  Dimensional = 'dimensional',
}

export enum HeroClass {
  Warrior = 'warrior',
  Tank = 'tank',
  Ranger = 'ranger',
  Mage = 'mage',
  Support = 'support',
}

export enum HeroType {
  Strength = 'strength',
  Agility = 'agility',
  Intelligence = 'intelligence',
}

@model()
export class Hero extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'string',
    required: true,
  })
  name: string;

  @property({
    type: 'string',
    required: true,
  })
  title: string;

  @property({
    type: 'string',
  })
  icon?: string;

  @property({
    type: 'string',
  })
  banner?: string;

  @property({
    type: 'array',
    itemType: 'string',
    default: [],
  })
  aliases?: string[];

  @property({
    type: 'string',
    required: true,
    jsonSchema: {
      enum: Object.values(HeroClass),
    },
  })
  klass: string;

  @property({
    type: 'string',
    required: true,
    jsonSchema: {
      enum: Object.values(HeroType),
    },
  })
  type: string;

  @property({
    type: 'string',
    required: true,
    jsonSchema: {
      enum: Object.values(HeroFaction),
    },
  })
  faction: string;

  @hasMany(() => Skill)
  skills?: Skill[];

  constructor(data?: Partial<Hero>) {
    super(data);
  }
}

export interface HeroRelations {
  // describe navigational properties here
}

export type HeroWithRelations = Hero & HeroRelations;
