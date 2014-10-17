describe('Boolean', function () {
  'use strict';

  describe('true', function () {
    it('should equal true even on the server', function () {
      var result = true;
      expect(result).toEqual(true);
    });
  });
});

