/* eslint-env mocha */

describe('client suite', () => {
  it('failing test', () => {
    throw new Error('error, test didn\'t pass');
  });
});
