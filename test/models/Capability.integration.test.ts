import { fail } from 'assert';
import { expect } from 'chai';
import {
  findAllCapabilties,
  createCapability,
  deleteCapability,
  Capability,
} from '../../src/models/Capability';

describe('Capability', () => {
  describe('findAllCapabilties', () => {
    it('should find all capabilities', async () => {
      const capabilities = await findAllCapabilties();

      expect(capabilities.length).to.equal(28);
      expect(capabilities[0].name).to.equal('MY_GAME_READ');
      expect(capabilities[1].name).to.equal('MY_GAME_WRITE');
      expect(capabilities[2].name).to.equal('MY_GAME_ACHIEVEMENT_READ');
      expect(capabilities[3].name).to.equal('MY_GAME_ACHIEVEMENT_WRITE');
      expect(capabilities[4].name).to.equal('MY_GAME_LEADERBOARD_READ');
      expect(capabilities[5].name).to.equal('MY_GAME_LEADERBOARD_WRITE');
      expect(capabilities[6].name).to.equal('GENERAL_READ');
      expect(capabilities[7].name).to.equal('GENERAL_WRITE');
      expect(capabilities[8].name).to.equal('THE_ARENA_READ');
      expect(capabilities[9].name).to.equal('THE_ARENA_WRITE');
      expect(capabilities[10].name).to.equal('THE_TOWER_READ');
      expect(capabilities[11].name).to.equal('THE_TOWER_WRITE');
      expect(capabilities[12].name).to.equal('WEAPONS_READ');
      expect(capabilities[13].name).to.equal('WEAPONS_WRITE');
      expect(capabilities[14].name).to.equal('ENEMY_READ');
      expect(capabilities[15].name).to.equal('ENEMY_WRITE');
      expect(capabilities[16].name).to.equal('ZONE_READ');
      expect(capabilities[17].name).to.equal('ZONE_WRITE');
      expect(capabilities[18].name).to.equal('ARENA_COMMAND');
      expect(capabilities[19].name).to.equal('ARENA_ACTION');
      expect(capabilities[20].name).to.equal('TOWER_COMMAND');
      expect(capabilities[21].name).to.equal('TOWER_ACTION');
      expect(capabilities[22].name).to.equal('TOWER_EVENT');
      expect(capabilities[23].name).to.equal('GAMESHQ_COMMAND');
      expect(capabilities[24].name).to.equal('USER_ROLE_WRITE');
      expect(capabilities[25].name).to.equal('USER_ROLE_READ');
      expect(capabilities[26].name).to.equal('CAPABILITY_READ');
      expect(capabilities[27].name).to.equal('CAPABILITY_WRITE');
    });
  });

  describe('createCapability', () => {
    it('should create a new capability', async () => {
      const name = 'NEW_CAPABILITY';
      const rslt = await createCapability({ name });
      const inDb = await Capability.findOne({ where: { name } });

      expect(rslt.name).to.equal(name);
      expect(inDb!.name).to.equal(name);
    });

    it('should throw error if name already exists', async () => {
      const name = 'GENERAL_READ';
      try {
        await createCapability({ name });
        fail('should not save capability with same name');
      } catch (e: any) {
        expect(e.message).to.equal('Validation error');
      }
    });

    after(async () => {
      await Capability.destroy({ where: { name: 'NEW_CAPABILITY' } });
    });
  });

  describe('deleteCapability', () => {
    it('should delete a capability', async () => {
      const name = 'CREATING_CAPABILITY';
      const created = await Capability.create({ name });
      const rslt = await deleteCapability(created.id);

      const inDB = await Capability.findOne({ where: { name } });

      expect(rslt).to.equal(1);
      expect(inDB).to.be.null;
    });

    it('should return 0 if capability does not exist', async () => {
      const rslt = await deleteCapability(52342343);
      expect(rslt).to.equal(0);
    });
  });
});
