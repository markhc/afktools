import { Connection, createConnection } from 'typeorm';
import { Hero } from './entities/Hero';
import { Skill } from './entities/Skill';
import { User } from './entities/User';
import config from './config';

function databaseConnect(): Promise<Connection> {
  return createConnection({
    type: 'mysql',
    host: config.dbHost,
    port: config.dbPort,
    username: config.dbUser,
    password: config.dbPass,
    database: config.dbName,
    synchronize: true,
    entities: [Hero, Skill, User],
  }).then(conn => {
    conn.synchronize();
    return conn;
  });
}

export { databaseConnect };
