import {
  belongsTo,
  Entity,
  hasOne,
  model,
  property,
} from '@loopback/repository';
import { Hero } from './hero.model';

@model()
export class Skill extends Entity {
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
  })
  icon?: string;

  @property({
    type: 'string',
    mysql: {
      dataType: 'VARCHAR',
      dataLength: 2048,
    },
  })
  description?: string;

  @property({
    type: 'string',
    required: true,
  })
  type: string;

  @property({
    type: 'array',
    itemType: 'object',
    required: true,
  })
  levels: object[];

  @belongsTo(() => Hero)
  heroId: number;

  constructor(data?: Partial<Skill>) {
    super(data);
  }
}

export interface SkillRelations {
  // describe navigational properties here
}

export type SkillWithRelations = Skill & SkillRelations;
