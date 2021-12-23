import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Skill } from './Skill';

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

@Entity()
export class Hero {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column()
  title!: string;

  @Column()
  icon!: string;

  @Column()
  banner!: string;

  @Column('simple-array')
  aliases!: string[];

  @Column({
    type: 'enum',
    enum: HeroClass,
    nullable: false,
  })
  klass!: HeroClass;

  @Column({
    type: 'enum',
    enum: HeroType,
    nullable: false,
  })
  type!: HeroType;

  @Column({
    type: 'enum',
    enum: HeroFaction,
    nullable: false,
  })
  faction!: HeroFaction;

  @OneToMany(() => Skill, skill => skill.hero, {
    cascade: ['insert', 'update'],
  })
  skills!: Skill[];
}
