import { expect } from 'chai';
import { roundTwoDecimalPlaces } from '../../../src/games/utils/math';

describe('roundTwoDecimalPlaces', () => {
  it('should round number to 2 decimal places', () => {
    expect(roundTwoDecimalPlaces(1.234)).to.equal(1.23);
    expect(roundTwoDecimalPlaces(9.999)).to.equal(10);
    expect(roundTwoDecimalPlaces(5.005)).to.equal(5.01);
  });

  it('should return same number if already rounded to 2 decimals', () => {
    expect(roundTwoDecimalPlaces(4.56)).to.equal(4.56);  
  });
});
