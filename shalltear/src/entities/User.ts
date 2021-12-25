import { Entity, Column, PrimaryColumn } from 'typeorm';

export enum UserRole {
  Basic = 'basic',
  Manager = 'manager',
  Admin = 'admin',
  Owner = 'owner',
}

@Entity({ name: 'User' })
export class User {
  @PrimaryColumn()
  id!: string;

  @Column()
  name!: string;

  @Column()
  email?: string;

  @Column()
  avatar!: string;

  @Column({
    type: 'enum',
    enum: UserRole,
  })
  role!: UserRole;

  @Column()
  access_token!: string;
}
