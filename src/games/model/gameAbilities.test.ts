import { expect } from 'chai';
import { Ability } from './GameAbilities';

describe('Game Abilities Class', () => {
  let mutableFirstAbility: Ability;
  const ONE = 1;
  const TEN = 10;
  before(() => {
    mutableFirstAbility = new Ability();
  });

  it('Should have the default values', () => {
    const defaultProperties = Ability.defaultProps();
    expect(mutableFirstAbility).to.have.property('properties').to.be.deep.equal(defaultProperties);
  });

  it('Should get a specific property', () => {
    const initiative = mutableFirstAbility.get('initiative');
    const defaultInitiative = ONE;
    expect(initiative).to.be.equal(defaultInitiative);
  });

  it('Should set a specific propery', () => {
    const attackBonusIncrease = TEN;
    mutableFirstAbility.set('flatAttackBonus', attackBonusIncrease);
    const flatAttackBonusValue = mutableFirstAbility.get('flatAttackBonus');
    expect(flatAttackBonusValue).to.be.equal(attackBonusIncrease);
  });

  it('Should create an Ability with custom values', () => {
    const defaultInitiative = ONE;
    const attackBonus = TEN;
    const defenseRate = 0.2;
    const stunBlockRate = 0.1;
    const weaponSearchRate = 0.4;
    const healingBoost = TEN;
    const simpleAbility = new Ability({
      flatAttackBonus: attackBonus,
      defenseRate,
      stunBlockRate,
      weaponSearchRate,
      flatHealingBoost: healingBoost,
    });
    expect(simpleAbility).to.be.instanceOf(Ability);
    expect(simpleAbility.get('initiative')).to.be.equal(defaultInitiative);
    expect(simpleAbility.get('flatAttackBonus')).to.be.equal(attackBonus);
    expect(simpleAbility.get('defenseRate')).to.be.equal(defenseRate);
    expect(simpleAbility.get('stunBlockRate')).to.be.equal(stunBlockRate);
    expect(simpleAbility.get('weaponSearchRate')).to.be.equal(weaponSearchRate);
    expect(simpleAbility.get('flatHealingBoost')).to.be.equal(healingBoost);
  });

  it('Should create an Ability with fixed decimal values', () => {
    const defaultInitiative = ONE;
    const attackBonus = TEN;
    const defenseRate = 0.2;
    const stunBlockRate = 0.1;
    const weaponSearchRate = 0.4;
    const healingBoost = TEN;
    const simpleAbility = new Ability({
      flatAttackBonus: attackBonus,
      defenseRate: 0.200000001,
      stunBlockRate: 0.100005,
      weaponSearchRate: 0.40062485,
      flatHealingBoost: healingBoost,
    });
    expect(simpleAbility).to.be.instanceOf(Ability);
    expect(simpleAbility.get('initiative')).to.be.equal(defaultInitiative);
    expect(simpleAbility.get('flatAttackBonus')).to.be.equal(attackBonus);
    expect(simpleAbility.get('defenseRate')).to.be.equal(defenseRate);
    expect(simpleAbility.get('stunBlockRate')).to.be.equal(stunBlockRate);
    expect(simpleAbility.get('weaponSearchRate')).to.be.equal(weaponSearchRate);
    expect(simpleAbility.get('flatHealingBoost')).to.be.equal(healingBoost);
  });

  it('Should calculate the output of each ability', () => {
    const defaultInitiative = ONE;
    const attackBonus = TEN;
    const defenseRate = 0.2;
    const stunBlockRate = 0.1;
    const weaponSearchRate = 0.4;
    const healingBoost = TEN;
    const simpleAbility = new Ability({
      flatAttackBonus: attackBonus,
      defenseRate,
      stunBlockRate,
      weaponSearchRate,
      flatHealingBoost: healingBoost,
    });
    const secondDefenseRate = 0.4;
    const secondInitiative = -0.3;
    const secondAttackBonus = -4;
    const secondArmorSearchRate = 0.1;
    const simplePerkAbility = new Ability({
      flatAttackBonus: secondAttackBonus,
      initiative: secondInitiative,
      defenseRate: secondDefenseRate,
      armorSearchRate: secondArmorSearchRate,
    });
    simpleAbility.calculateAbilities(simplePerkAbility.toJSON());
    expect(simpleAbility).to.be.instanceOf(Ability);
    expect(simpleAbility.get('initiative')).to.be.equal(defaultInitiative + secondInitiative);
    expect(simpleAbility.get('flatAttackBonus')).to.be.equal(attackBonus + secondAttackBonus);
    expect(simpleAbility.get('defenseRate')).to.be.equal(defenseRate + secondDefenseRate);
    expect(simpleAbility.get('stunBlockRate')).to.be.equal(stunBlockRate);
    expect(simpleAbility.get('weaponSearchRate')).to.be.equal(weaponSearchRate);
    expect(simpleAbility.get('flatHealingBoost')).to.be.equal(healingBoost);
    expect(simpleAbility.get('armorSearchRate')).to.be.equal(secondArmorSearchRate);
  });
});
