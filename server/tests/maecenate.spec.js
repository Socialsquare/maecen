import test from 'ava'
import request from 'supertest-as-promised'
import uuid from 'node-uuid'
import nock from 'nock'
import app from '../../index'
import { knex } from '../database'
import { base, userId } from './util'
import User from '../models/User'

test.beforeEach(async t => {
  await knex.migrate.latest()

  let authUser = new User({
    id: userId,
    first_name: 'John',
    last_name: 'Doe',
    email: 'john@doe.com',
    password: 'password'
  })

  await authUser.save(null, { method: 'insert' })
  t.context.authUser = authUser
})
test.afterEach.always(t => knex.migrate.rollback())

test('POST /api/maecenates/create', async t => {
  const logoId = uuid.v1()
  await knex('files').insert({
    id: logoId, type: 'image/jpg', url: 'https://fakeurl.com', role: 'MEDIA' })

  const coverId = uuid.v1()
  await knex('files').insert({
    id: coverId, type: 'image/jpg', url: 'https://fakeurl.com', role: 'MEDIA' })

  const maecenateData = {
    title: 'Some Maecenate',
    creator: t.context.authUser.id,
    logo_media: logoId,
    cover_media: coverId,
    teaser: 'Quisque laoreet magna amet.',
    description: 'Cras luctus velit non dignissim magna amet.',
    monthly_minimum: 20
  }

  nock(`http://localhost:${app.get('port')}`)
    .intercept('some-maecenate', 'HEAD')
    .reply(404, 'No Page')

  const res = await request(app)
    .post('/api/maecenates/create')
    .set(base)
    .send({ maecenate: maecenateData })

  t.is(res.status, 200)
  const { result, entities } = res.body
  t.is(result.length, 1)
  const id = result[0]
  t.is(Object.keys(entities.maecenates).length, 1)
  t.truthy(entities.maecenates[id].logo)
  t.truthy(entities.maecenates[id].cover)
})
