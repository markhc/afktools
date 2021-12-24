import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MysqldbDataSource} from '../datasources';
import {Hero, HeroRelations} from '../models';

export class HeroRepository extends DefaultCrudRepository<
  Hero,
  typeof Hero.prototype.id,
  HeroRelations
> {
  constructor(
    @inject('datasources.mysqldb') dataSource: MysqldbDataSource,
  ) {
    super(Hero, dataSource);
  }
}
