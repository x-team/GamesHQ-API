import { fail } from 'assert';
import { expect } from 'chai';
import { Capability } from '../../src/models';
import { Op } from 'sequelize';
import {
  findAllUserRolesWithCapabilties,
  createOrUpdateUserRole,
  UserRole,
} from '../../src/models/UserRole';

describe('UserRole', () => {
  describe('findAllUserRolesWithCapabilties', () => {
    it('should find user role and capabilities for USER ROLE', async () => {
      const userRoles = await findAllUserRolesWithCapabilties();

      expect(userRoles.length).to.equal(4);
      for (const role of userRoles) {
        expect(['user', 'gamedev', 'admin', 'super_admin']).includes(role.name);

        switch (role.name) {
          case 'user':
            expect(role._capabilities?.length).to.equal(userCapabilities.length);
            expect(userCapabilities).to.deep.equal(role._capabilities);
            break;
          case 'gamedev':
            expect(role._capabilities?.length).to.equal(gamedevCapabilities.length);
            for (const capability of role._capabilities || []) {
              expect(gamedevCapabilities).includes(capability.name);
            }
            break;
          case 'admin':
            expect(role._capabilities?.length).to.equal(adminCapabilities.length);
            for (const capability of role._capabilities || []) {
              expect(adminCapabilities).includes(capability.name);
            }
            break;
          case 'super_admin':
            expect(role._capabilities?.length).to.equal(superAdminCapabilities.length);
            for (const capability of role._capabilities || []) {
              expect(superAdminCapabilities).includes(capability.name);
            }
            break;
          default:
            fail('error on user role test');
        }
      }
    });
  });

  describe('createOrUpdateUserRole', () => {
    it('should create a new user role with capabilities', async () => {
      const generalReadCapability = await Capability.findOne({ where: { name: 'GENERAL_READ' } });
      const generalWriteCapability = await Capability.findOne({ where: { name: 'GENERAL_WRITE' } });

      const upsertUserRoleData = {
        name: 'NEW_USER_ROLE_WITH_CAPABILITIES',
        _capabilities: [generalReadCapability!, generalWriteCapability!],
      };

      const rslt = await createOrUpdateUserRole(upsertUserRoleData);

      const userRole = await UserRole.findByPk(rslt!.id, {
        include: [
          {
            association: UserRole.associations._capabilities,
          },
        ],
      });

      expect(rslt?.toJSON()).to.deep.equal({
        id: 5,
        name: 'NEW_USER_ROLE_WITH_CAPABILITIES',
      });
      expect(userRole!.id).to.equal(5);
      expect(userRole!.name).to.equal('NEW_USER_ROLE_WITH_CAPABILITIES');
      expect(userRole!._capabilities?.length).to.equal(2);
      expect(userRole!._capabilities?.[0].name).to.equal('GENERAL_READ');
      expect(userRole!._capabilities?.[1].name).to.equal('GENERAL_WRITE');
    });

    it('should update a user role with capabilities', async () => {
      const generalReadCapability = await Capability.findOne({ where: { name: 'GENERAL_READ' } });
      const createUserRoleData = {
        name: 'USER_ROLE_WITH_CAPABILITIES',
        _capabilities: [generalReadCapability!],
      };

      const created = await createOrUpdateUserRole(createUserRoleData);

      const generalWriteCapability = await Capability.findOne({ where: { name: 'GENERAL_WRITE' } });
      const updateUserRoleData = {
        id: created!.id,
        name: 'UPDATED_USER_ROLE_WITH_CAPABILITIES',
        _capabilities: [generalWriteCapability!],
      };

      const updated = await createOrUpdateUserRole(updateUserRoleData);

      const userRoleInDB = await UserRole.findByPk(updated!.id, {
        include: [
          {
            association: UserRole.associations._capabilities,
          },
        ],
      });

      expect(created?.toJSON()).to.deep.equal({
        id: 6,
        name: 'USER_ROLE_WITH_CAPABILITIES',
      });
      expect(updated?.toJSON()).to.deep.equal({
        id: 6,
        name: 'UPDATED_USER_ROLE_WITH_CAPABILITIES',
      });
      expect(userRoleInDB!.id).to.equal(6);
      expect(userRoleInDB!.name).to.equal('UPDATED_USER_ROLE_WITH_CAPABILITIES');
      expect(userRoleInDB!._capabilities?.length).to.equal(1);
      expect(userRoleInDB!._capabilities?.[0].name).to.equal('GENERAL_WRITE');
    });

    it('should create a new user role without capabilities', async () => {
      const upsertUserRoleData = {
        name: 'NEW_USER_ROLE',
        _capabilities: [],
      };

      const rslt = await createOrUpdateUserRole(upsertUserRoleData);

      expect(rslt?.toJSON()).to.deep.equal({
        id: 7,
        name: 'NEW_USER_ROLE',
      });
    });

    after(async () => {
      await UserRole.destroy({
        where: {
          [Op.or]: [
            {
              name: 'NEW_USER_ROLE',
            },
            {
              name: 'NEW_USER_ROLE_WITH_CAPABILITIES',
            },
            {
              name: 'UPDATED_USER_ROLE_WITH_CAPABILITIES',
            },
          ],
        },
      });
    });
  });
});

const userCapabilities: string[] = [];
const gamedevCapabilities = [
  'MY_GAME_READ',
  'MY_GAME_WRITE',
  'MY_GAME_ACHIEVEMENT_READ',
  'MY_GAME_ACHIEVEMENT_WRITE',
  'MY_GAME_LEADERBOARD_READ',
  'MY_GAME_LEADERBOARD_WRITE',
];
const adminCapabilities = [
  'MY_GAME_READ',
  'MY_GAME_WRITE',
  'MY_GAME_ACHIEVEMENT_READ',
  'MY_GAME_ACHIEVEMENT_WRITE',
  'MY_GAME_LEADERBOARD_READ',
  'MY_GAME_LEADERBOARD_WRITE',
  'GENERAL_READ',
  'GENERAL_WRITE',
  'THE_ARENA_READ',
  'THE_ARENA_WRITE',
  'THE_TOWER_READ',
  'THE_TOWER_WRITE',
  'WEAPONS_READ',
  'WEAPONS_WRITE',
  'ENEMY_READ',
  'ENEMY_WRITE',
  'ZONE_READ',
  'ZONE_WRITE',
  'ARENA_COMMAND',
  'ARENA_ACTION',
  'TOWER_COMMAND',
  'TOWER_ACTION',
  'TOWER_EVENT',
  'GAMESHQ_COMMAND',
];
const superAdminCapabilities = [
  'MY_GAME_READ',
  'MY_GAME_WRITE',
  'MY_GAME_ACHIEVEMENT_READ',
  'MY_GAME_ACHIEVEMENT_WRITE',
  'MY_GAME_LEADERBOARD_READ',
  'MY_GAME_LEADERBOARD_WRITE',
  'GENERAL_READ',
  'GENERAL_WRITE',
  'USER_ROLE_WRITE',
  'USER_ROLE_READ',
  'THE_ARENA_READ',
  'THE_ARENA_WRITE',
  'THE_TOWER_READ',
  'THE_TOWER_WRITE',
  'WEAPONS_READ',
  'WEAPONS_WRITE',
  'ENEMY_READ',
  'ENEMY_WRITE',
  'ZONE_READ',
  'ZONE_WRITE',
  'ARENA_COMMAND',
  'ARENA_ACTION',
  'TOWER_COMMAND',
  'TOWER_ACTION',
  'TOWER_EVENT',
  'GAMESHQ_COMMAND',
  'CAPABILITY_READ',
  'CAPABILITY_WRITE',
];
