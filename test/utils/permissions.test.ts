import { expect } from 'chai';
import { isScopeRole } from '../../src/utils/permissions';
import { USER_ROLE_NAME } from '../../src/consts/model';

describe('Permissions Utils', () => {
  describe('isScopeRole', () => {
    it('should return true when role is in scope', () => {
      const scope = [USER_ROLE_NAME.ADMIN, USER_ROLE_NAME.USER];
      expect(isScopeRole(scope, USER_ROLE_NAME.ADMIN)).to.be.true;
    });

    it('should return false when role is not in scope', () => {
      const scope = [USER_ROLE_NAME.USER];
      expect(isScopeRole(scope, USER_ROLE_NAME.ADMIN)).to.be.false;
    });

    it('should handle empty scope', () => {
      expect(isScopeRole([], USER_ROLE_NAME.ADMIN)).to.be.false;
    });

    it('should handle undefined scope', () => {
      expect(isScopeRole(undefined, USER_ROLE_NAME.ADMIN)).to.be.false;
    });
  });
});
