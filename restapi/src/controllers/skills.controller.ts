import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getModelSchemaRef,
  patch,
  put,
  del,
  requestBody,
  response,
} from '@loopback/rest';
import { Skill } from '../models';
import { SkillRepository } from '../repositories';

export class SkillsController {
  constructor(
    @repository(SkillRepository)
    public skillRepository: SkillRepository
  ) {}

  @post('/skills')
  @response(200, {
    description: 'Skill model instance',
    content: { 'application/json': { schema: getModelSchemaRef(Skill) } },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Skill, {
            title: 'NewSkill',
            exclude: ['id'],
          }),
        },
      },
    })
    skill: Omit<Skill, 'id'>
  ): Promise<Skill> {
    return this.skillRepository.create(skill);
  }

  @get('/skills/count')
  @response(200, {
    description: 'Skill model count',
    content: { 'application/json': { schema: CountSchema } },
  })
  async count(@param.where(Skill) where?: Where<Skill>): Promise<Count> {
    return this.skillRepository.count(where);
  }

  @get('/skills')
  @response(200, {
    description: 'Array of Skill model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Skill, { includeRelations: true }),
        },
      },
    },
  })
  async find(@param.filter(Skill) filter?: Filter<Skill>): Promise<Skill[]> {
    return this.skillRepository.find(filter);
  }

  @patch('/skills')
  @response(200, {
    description: 'Skill PATCH success count',
    content: { 'application/json': { schema: CountSchema } },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Skill, { partial: true }),
        },
      },
    })
    skill: Skill,
    @param.where(Skill) where?: Where<Skill>
  ): Promise<Count> {
    return this.skillRepository.updateAll(skill, where);
  }

  @get('/skills/{id}')
  @response(200, {
    description: 'Skill model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Skill, { includeRelations: true }),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(Skill, { exclude: 'where' })
    filter?: FilterExcludingWhere<Skill>
  ): Promise<Skill> {
    return this.skillRepository.findById(id, filter);
  }

  @patch('/skills/{id}')
  @response(204, {
    description: 'Skill PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Skill, { partial: true }),
        },
      },
    })
    skill: Skill
  ): Promise<void> {
    await this.skillRepository.updateById(id, skill);
  }

  @put('/skills/{id}')
  @response(204, {
    description: 'Skill PUT success',
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() skill: Skill
  ): Promise<void> {
    await this.skillRepository.replaceById(id, skill);
  }

  @del('/skills/{id}')
  @response(204, {
    description: 'Skill DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.skillRepository.deleteById(id);
  }
}
