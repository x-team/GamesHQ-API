import { expect } from 'chai';
import { v4 as uuid } from 'uuid';
import {
  getAllCapabilitiesRoute,
  createCapabilityRoute,
  deleteCapabilityRoute,
} from '../../../../../src/modules/dashboard/admin/adminRoutes/capabilityAdminRoutes';
import { USER_ROLE_LEVEL } from '../../../../../src/consts/model';
import { Capability, Session } from '../../../../../src/models';
import { createTestUser, getCustomTestServer } from '../../../../test-utils';

describe('capabilityRoleAdminRoutes', () => {
  const testServer = getCustomTestServer();

  testServer.route([getAllCapabilitiesRoute, createCapabilityRoute, deleteCapabilityRoute]);

  describe('getAllCapabilitiesRoute', async () => {
    it('should return 200 status code on GET /admin/capabilities', async () => {
      const testUser = await createTestUser({ _roleId: USER_ROLE_LEVEL.SUPER_ADMIN });
      const session = await Session.create({
        token: uuid(),
        _userId: testUser.id,
      });

      const injectOptions = {
        method: 'GET',
        url: '/admin/capabilities',
        headers: {
          'xtu-session-token': session.token,
        },
      };

      const rslt = await testServer.inject(injectOptions);
      const payload = JSON.parse(rslt.payload);

      expect(rslt.statusCode).to.equal(200);
      expect(payload.length).to.equal(28);
      expect(payload[0].name).to.equal('MY_GAME_READ');
      expect(payload[1].name).to.equal('MY_GAME_WRITE');
      expect(payload[2].name).to.equal('MY_GAME_ACHIEVEMENT_READ');
      expect(payload[3].name).to.equal('MY_GAME_ACHIEVEMENT_WRITE');
      expect(payload[4].name).to.equal('MY_GAME_LEADERBOARD_READ');
      expect(payload[5].name).to.equal('MY_GAME_LEADERBOARD_WRITE');
      expect(payload[6].name).to.equal('GENERAL_READ');
      expect(payload[7].name).to.equal('GENERAL_WRITE');
      expect(payload[8].name).to.equal('THE_ARENA_READ');
      expect(payload[9].name).to.equal('THE_ARENA_WRITE');
      expect(payload[10].name).to.equal('THE_TOWER_READ');
      expect(payload[11].name).to.equal('THE_TOWER_WRITE');
      expect(payload[12].name).to.equal('WEAPONS_READ');
      expect(payload[13].name).to.equal('WEAPONS_WRITE');
      expect(payload[14].name).to.equal('ENEMY_READ');
      expect(payload[15].name).to.equal('ENEMY_WRITE');
      expect(payload[16].name).to.equal('ZONE_READ');
      expect(payload[17].name).to.equal('ZONE_WRITE');
      expect(payload[18].name).to.equal('ARENA_COMMAND');
      expect(payload[19].name).to.equal('ARENA_ACTION');
      expect(payload[20].name).to.equal('TOWER_COMMAND');
      expect(payload[21].name).to.equal('TOWER_ACTION');
      expect(payload[22].name).to.equal('TOWER_EVENT');
      expect(payload[23].name).to.equal('GAMESHQ_COMMAND');
      expect(payload[24].name).to.equal('USER_ROLE_WRITE');
      expect(payload[25].name).to.equal('USER_ROLE_READ');
      expect(payload[26].name).to.equal('CAPABILITY_READ');
      expect(payload[27].name).to.equal('CAPABILITY_WRITE');
    });

    it('should return error if user does not have permission', async () => {
      const testUser = await createTestUser({ _roleId: USER_ROLE_LEVEL.GAME_DEV });
      const session = await Session.create({
        token: uuid(),
        _userId: testUser.id,
      });

      const injectOptions = {
        method: 'GET',
        url: '/admin/capabilities',
        headers: {
          'xtu-session-token': session.token,
        },
      };

      const rslt = await testServer.inject(injectOptions);
      const payload = JSON.parse(rslt.payload);

      expect(rslt.statusCode).to.equal(401);
      expect(payload).to.deep.equal({
        statusCode: 401,
        error: 'Unauthorized',
        message: 'Only authorized users can access here',
      });
    });
  });

  describe('createCapabilityRoute', async () => {
    it('should return 200 status code on POST /admin/capabilities', async () => {
      const testUser = await createTestUser({ _roleId: USER_ROLE_LEVEL.SUPER_ADMIN });
      const session = await Session.create({
        token: uuid(),
        _userId: testUser.id,
      });

      const postPayload = {
        name: 'NEW_CAPABILITY',
      };

      const injectOptions = {
        method: 'POST',
        url: '/admin/capabilities',
        headers: {
          'xtu-session-token': session.token,
        },
        payload: postPayload,
      };

      const rslt = await testServer.inject(injectOptions);
      const payload = JSON.parse(rslt.payload);

      expect(rslt.statusCode).to.equal(200);
      expect(Object.keys(payload)).to.deep.equal(['id', 'name']);
      expect(payload.name).to.equal('NEW_CAPABILITY');
    });

    it('should return error if user does not have permission', async () => {
      const testUser = await createTestUser({ _roleId: USER_ROLE_LEVEL.GAME_DEV });
      const session = await Session.create({
        token: uuid(),
        _userId: testUser.id,
      });

      const postPayload = {
        name: 'NEW_CAPABILITY',
      };

      const injectOptions = {
        method: 'POST',
        url: '/admin/capabilities',
        headers: {
          'xtu-session-token': session.token,
        },
        payload: postPayload,
      };

      const rslt = await testServer.inject(injectOptions);
      const payload = JSON.parse(rslt.payload);

      expect(rslt.statusCode).to.equal(401);
      expect(payload).to.deep.equal({
        statusCode: 401,
        error: 'Unauthorized',
        message: 'Only authorized users can access here',
      });
    });

    after(async () => {
      await Capability.destroy({ where: { name: 'NEW_CAPABILITY' } });
    });
  });

  describe('deleteCapabilityRoute', async () => {
    it('should return 200 status code on DELETE /admin/capabilities', async () => {
      const testUser = await createTestUser({ _roleId: USER_ROLE_LEVEL.SUPER_ADMIN });
      const session = await Session.create({
        token: uuid(),
        _userId: testUser.id,
      });

      const name = 'NEW_CAPABILITY';
      const capability = await Capability.create({ name });

      const injectOptions = {
        method: 'DELETE',
        url: `/admin/capabilities/${capability.id}`,
        headers: {
          'xtu-session-token': session.token,
        },
      };

      const rslt = await testServer.inject(injectOptions);
      const payload = JSON.parse(rslt.payload);

      const inDb = await Capability.findOne({ where: { name } });

      expect(rslt.statusCode).to.equal(200);
      expect(payload).to.deep.equal({
        success: true,
      });
      expect(inDb).to.be.null;
    });

    it('should throw 404 status code on DELETE /admin/capabilities when capability not found', async () => {
      const testUser = await createTestUser({ _roleId: USER_ROLE_LEVEL.SUPER_ADMIN });
      const session = await Session.create({
        token: uuid(),
        _userId: testUser.id,
      });

      const injectOptions = {
        method: 'DELETE',
        url: `/admin/capabilities/123442354`,
        headers: {
          'xtu-session-token': session.token,
        },
      };

      const rslt = await testServer.inject(injectOptions);
      const payload = JSON.parse(rslt.payload);

      expect(rslt.statusCode).to.equal(404);
      expect(payload).to.deep.equal({
        statusCode: 404,
        error: 'Not Found',
        message: 'capability not found',
      });
    });

    it('should return error if user does not have permission', async () => {
      const testUser = await createTestUser({ _roleId: USER_ROLE_LEVEL.GAME_DEV });
      const session = await Session.create({
        token: uuid(),
        _userId: testUser.id,
      });

      const name = 'NEW_CAPABILITY';
      const capability = await Capability.create({ name });

      const injectOptions = {
        method: 'DELETE',
        url: `/admin/capabilities/${capability.id}`,
        headers: {
          'xtu-session-token': session.token,
        },
      };

      const rslt = await testServer.inject(injectOptions);
      const payload = JSON.parse(rslt.payload);

      expect(rslt.statusCode).to.equal(401);
      expect(payload).to.deep.equal({
        statusCode: 401,
        error: 'Unauthorized',
        message: 'Only authorized users can access here',
      });
    });

    after(async () => {
      await Capability.destroy({ where: { name: 'NEW_CAPABILITY' } });
    });
  });
});
