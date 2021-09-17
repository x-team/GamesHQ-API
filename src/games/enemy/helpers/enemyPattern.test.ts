import { expect } from 'chai';
import { GAME_TYPE } from '../../consts/global';
import { generateEnemyPatterns } from './enemyPatterns';

describe('Generate Enemy Patterns For The Tower', () => {
  it('Should calculate all the possible patterns for an enemy with length 1', () => {
    const patternLenght = 1;
    const expectedTreeLenght = 3;
    const patterns = generateEnemyPatterns(patternLenght, GAME_TYPE.TOWER);
    expect(patterns.length).to.be.eql(expectedTreeLenght);
  });
  it('Should calculate all the possible patterns for an enemy with length 2', () => {
    const patternLenght = 2;
    const expectedTreeLenght = 9;
    const patterns = generateEnemyPatterns(patternLenght, GAME_TYPE.TOWER);
    expect(patterns.length).to.be.eql(expectedTreeLenght);
  });
  it('Should calculate all the possible patterns for an enemy with length 3', () => {
    const patternLenght = 3;
    const expectedTreeLenght = 27;
    const patterns = generateEnemyPatterns(patternLenght, GAME_TYPE.TOWER);
    expect(patterns.length).to.be.eql(expectedTreeLenght);
  });
  it('Should calculate all the possible patterns for an enemy with length 4', () => {
    const patternLenght = 4;
    const expectedTreeLenght = 81;
    const patterns = generateEnemyPatterns(patternLenght, GAME_TYPE.TOWER);
    expect(patterns.length).to.be.eql(expectedTreeLenght);
  });
  it('Should calculate all the possible patterns for an enemy with length 5', () => {
    const patternLenght = 5;
    const expectedTreeLenght = 243;
    const patterns = generateEnemyPatterns(patternLenght, GAME_TYPE.TOWER);
    expect(patterns.length).to.be.eql(expectedTreeLenght);
  });
});
