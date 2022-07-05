import { expect } from 'chai';
import { Op } from 'sequelize';
import { v4 as uuid } from 'uuid';
import {
  getAllUserRolesRoute,
  upsertUserRolesRoute,
  deleteUserRolesRoute,
} from '../../../../../src/modules/dashboard/admin/adminRoutes/userRoleAdminRoutes';
import { USER_ROLE_LEVEL } from '../../../../../src/consts/model';
import { Session, UserRole } from '../../../../../src/models';
import { createTestUser, getCustomTestServer } from '../../../../test-utils';

describe('userRoleAdminRoutes', () => {
  const testServer = getCustomTestServer();

  testServer.route([getAllUserRolesRoute, upsertUserRolesRoute, deleteUserRolesRoute]);

  describe('getAllUserRolesRoute', async () => {
    it('should return 200 status code on GET /admin/userrole', async () => {
      const testUser = await createTestUser({ _roleId: USER_ROLE_LEVEL.SUPER_ADMIN });
      const session = await Session.create({
        token: uuid(),
        _userId: testUser.id,
      });

      const injectOptions = {
        method: 'GET',
        url: '/admin/userrole',
        headers: {
          'xtu-session-token': session.token,
        },
      };

      const rslt = await testServer.inject(injectOptions);
      const payload = JSON.parse(rslt.payload);

      expect(rslt.statusCode).to.equal(200);
      expect(payload.length).to.equal(4);
      expect(Object.keys(payload[0])).to.deep.equal(['id', 'name', '_capabilities']);
      expect(payload[0].name).to.equal('admin');
      expect(payload[0]._capabilities.length).to.equal(24);
      expect(Object.keys(payload[0]._capabilities[0])).to.deep.equal(['id', 'name']);
      expect(payload[1].name).to.equal('gamedev');
      expect(payload[1]._capabilities.length).to.equal(6);
      expect(payload[2].name).to.equal('super_admin');
      expect(payload[2]._capabilities.length).to.equal(28);
      expect(payload[3].name).to.equal('user');
      expect(payload[3]._capabilities.length).to.equal(0);
    });

    it('should return error if user does not have permission', async () => {
      const testUser = await createTestUser({ _roleId: USER_ROLE_LEVEL.GAME_DEV });
      const session = await Session.create({
        token: uuid(),
        _userId: testUser.id,
      });

      const injectOptions = {
        method: 'GET',
        url: '/admin/userrole',
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

  describe('upsertUserRolesRoute', async () => {
    it('should return 200 status code on POST /admin/userrole', async () => {
      const testUser = await createTestUser({ _roleId: USER_ROLE_LEVEL.SUPER_ADMIN });
      const session = await Session.create({
        token: uuid(),
        _userId: testUser.id,
      });

      const postPayload = {
        name: 'NEW_USER_ROLE',
        _capabilities: [
          {
            id: 1,
            name: 'MY_GAME_READ',
          },
        ],
      };

      const injectOptions = {
        method: 'POST',
        url: '/admin/userrole',
        headers: {
          'xtu-session-token': session.token,
        },
        payload: postPayload,
      };

      const rslt = await testServer.inject(injectOptions);
      const payload = JSON.parse(rslt.payload);

      expect(rslt.statusCode).to.equal(200);
      expect(Object.keys(payload)).to.deep.equal(['name', 'id', '_capabilities']);
      expect(payload.name).to.equal('NEW_USER_ROLE');
      expect(payload._capabilities).to.deep.equal([
        {
          id: 1,
          name: 'MY_GAME_READ',
        },
      ]);
    });

    it('should return 200 status code on POST /admin/userrole without capabilities', async () => {
      const testUser = await createTestUser({ _roleId: USER_ROLE_LEVEL.SUPER_ADMIN });
      const session = await Session.create({
        token: uuid(),
        _userId: testUser.id,
      });

      const postPayload = {
        name: 'ANOTHER_NEW_USER_ROLE',
        _capabilities: [],
      };

      const injectOptions = {
        method: 'POST',
        url: '/admin/userrole',
        headers: {
          'xtu-session-token': session.token,
        },
        payload: postPayload,
      };

      const rslt = await testServer.inject(injectOptions);
      const payload = JSON.parse(rslt.payload);

      expect(rslt.statusCode).to.equal(200);
      expect(Object.keys(payload)).to.deep.equal(['name', 'id', '_capabilities']);
      expect(payload.name).to.equal('ANOTHER_NEW_USER_ROLE');
      expect(payload._capabilities.length).to.equal(0);
    });

    it('should return error if user does not have permission', async () => {
      const testUser = await createTestUser({ _roleId: USER_ROLE_LEVEL.GAME_DEV });
      const session = await Session.create({
        token: uuid(),
        _userId: testUser.id,
      });

      const postPayload = {
        name: 'ANOTHER_NEW_USER_ROLE',
        _capabilities: [],
      };

      const injectOptions = {
        method: 'POST',
        url: '/admin/userrole',
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

    it('should return error if payload is invalid', async () => {
      const testUser = await createTestUser({ _roleId: USER_ROLE_LEVEL.GAME_DEV });
      const session = await Session.create({
        token: uuid(),
        _userId: testUser.id,
      });

      const postPayload = {
        namess: 'ANOTHER_NEW_USER_ROLE',
        // _capabilities: []
      };

      const injectOptions = {
        method: 'POST',
        url: '/admin/userrole',
        headers: {
          'xtu-session-token': session.token,
        },
        payload: postPayload,
      };

      const rslt = await testServer.inject(injectOptions);
      const payload = JSON.parse(rslt.payload);

      expect(rslt.statusCode).to.equal(400);
      expect(payload).to.deep.equal({
        statusCode: 400,
        error: 'Bad Request',
        message: 'Invalid request payload input',
      });
    });

    after(async () => {
      await UserRole.destroy({
        where: {
          [Op.or]: [{ name: 'NEW_USER_ROLE' }, { name: 'ANOTHER_NEW_USER_ROLE' }],
        },
      });
    });
  });

  describe('deleteUserRolesRoute', async () => {
    it('should return 200 status code on DELETE /admin/userrole', async () => {
      const testUser = await createTestUser({ _roleId: USER_ROLE_LEVEL.SUPER_ADMIN });
      const session = await Session.create({
        token: uuid(),
        _userId: testUser.id,
      });

      const userRole = await UserRole.create({
        id: 98989,
        name: 'USER_ROLE_TO_DELETE',
      });

      const injectOptions = {
        method: 'DELETE',
        url: `/admin/userrole/${userRole.id}`,
        headers: {
          'xtu-session-token': session.token,
        },
      };

      const rslt = await testServer.inject(injectOptions);
      const payload = JSON.parse(rslt.payload);

      const inDB = await UserRole.findOne({ where: { name: 'USER_ROLE_TO_DELETE' } });

      expect(rslt.statusCode).to.equal(200);
      expect(payload).to.deep.equal({
        success: true,
      });
      expect(inDB).to.be.null;
    });

    it('should return error if SUPER ADMIN Role is being deleted', async () => {
      const testUser = await createTestUser({ _roleId: USER_ROLE_LEVEL.SUPER_ADMIN });
      const session = await Session.create({
        token: uuid(),
        _userId: testUser.id,
      });

      const injectOptions = {
        method: 'DELETE',
        url: `/admin/userrole/4`,
        headers: {
          'xtu-session-token': session.token,
        },
      };

      const rslt = await testServer.inject(injectOptions);
      const payload = JSON.parse(rslt.payload);

      expect(rslt.statusCode).to.equal(403);
      expect(payload).to.deep.equal({
        statusCode: 403,
        error: 'Forbidden',
        message: 'that role cannot be deleted',
      });
    });

    it('should return error if role does not exist', async () => {
      const testUser = await createTestUser({ _roleId: USER_ROLE_LEVEL.SUPER_ADMIN });
      const session = await Session.create({
        token: uuid(),
        _userId: testUser.id,
      });

      const injectOptions = {
        method: 'DELETE',
        url: `/admin/userrole/789`,
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
        message: 'user role not found',
      });
    });

    it('should return error if user does not have permission', async () => {
      const testUser = await createTestUser({ _roleId: USER_ROLE_LEVEL.GAME_DEV });
      const session = await Session.create({
        token: uuid(),
        _userId: testUser.id,
      });
      const injectOptions = {
        method: 'DELETE',
        url: `/admin/userrole/123`,
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
});
