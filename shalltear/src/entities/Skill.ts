import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Hero } from './Hero';

export enum SkillType {
  Signature = 'signature',
  Furniture = 'furniture',
  Ultimate = 'ultimate',
  Basic = 'basic',
}

@Entity()
export class Skill {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column()
  icon!: string;

  @Column('varchar', { length: 1024 })
  description!: string;

  @Column({
    type: 'enum',
    enum: SkillType,
  })
  type!: SkillType;

  @Column('simple-json')
  levels!: { unlocksAt: string; description: string }[];

  @ManyToOne(() => Hero, hero => hero.skills)
  @JoinColumn()
  hero!: Hero;
}
