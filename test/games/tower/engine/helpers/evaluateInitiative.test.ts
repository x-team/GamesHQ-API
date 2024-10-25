import { expect } from 'chai';
import sinon from 'sinon';
import { evaluateInitiative } from '../../../../../src/games/tower/repositories/tower/engine/helpers/evaluate-initiative';
import { TowerRaider, TowerFloorBattlefieldEnemy } from '../../../../../src/models';

describe('Evaluate Initiative', () => {
  let addInitiativeStub: sinon.SinonStub;
  let subInitiativeStub: sinon.SinonStub;

  beforeEach(() => {
    addInitiativeStub = sinon.stub().resolves();
    subInitiativeStub = sinon.stub().resolves();
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should evaluate raider initiative correctly', async () => {
    const mockRaider = {
      addOrSubtractInitiative: addInitiativeStub
    } as unknown as TowerRaider;

    const mockTarget = {
      addOrSubtractInitiative: subInitiativeStub
    } as unknown as TowerFloorBattlefieldEnemy;

    const mockWeapon = {
      _weapon: {
        minorDamageRate: 10,
        majorDamageRate: 20
      }
    };

    await evaluateInitiative({
      attacker: mockRaider,
      isRaiderAttacking: true,
      weapon: mockWeapon as any,
      damageDelt: 18,
      target: mockTarget
    }, {} as any);

    expect(addInitiativeStub.calledWith('add')).to.be.true;
    expect(subInitiativeStub.calledWith('sub')).to.be.true;
  });

  it('should evaluate enemy initiative correctly', async () => {
    const mockEnemy = {
      addOrSubtractInitiative: addInitiativeStub,
      _towerFloorEnemy: {
        _enemy: {
          minorDamageRate: 10,
          majorDamageRate: 20
        }
      }
    } as unknown as TowerFloorBattlefieldEnemy;

    const mockTarget = {
      addOrSubtractInitiative: subInitiativeStub
    } as unknown as TowerRaider;

    await evaluateInitiative({
      attacker: mockEnemy,
      isRaiderAttacking: false,
      damageDelt: 18,
      target: mockTarget
    }, {} as any);

    expect(addInitiativeStub.calledWith('add')).to.be.true;
    expect(subInitiativeStub.calledWith('sub')).to.be.true;
  });
});
