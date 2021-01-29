var update = require('./');
var expect = require('expect');

describe('update', function() {
  describe('default export', function() {
    it('should equal update', function() {
      expect(update.default).toEqual(update);
    });
  });

  describe('$push', function() {
    it('pushes', function() {
      expect(update([1], {$push: [7]})).toEqual([1, 7]);
    });
    it('does not mutate the original object', function() {
      var obj = [1];
      update(obj, {$push: [7]});
      expect(obj).toEqual([1]);
    });
    it('only pushes an array', function() {
      expect(update.bind(null, [], {$push: 7})).toThrow(
        'update(): expected spec of $push to be an array; got 7. Did you ' +
        'forget to wrap your parameter in an array?'
      );
    });
    it('only pushes unto an array', function() {
      expect(update.bind(null, 1, {$push: 7})).toThrow(
        'update(): expected target of $push to be an array; got 1.'
      );
    });
    it('keeps reference equality when possible', function() {
      var original = ['x'];
      expect(update(original, {$push: []})).toBe(original)
    });
  });

  describe('$unshift', function() {
    it('unshifts', function() {
      expect(update([1], {$unshift: [7]})).toEqual([7, 1]);
    });
    it('does not mutate the original object', function() {
      var obj = [1];
      update(obj, {$unshift: [7]});
      expect(obj).toEqual([1]);
    });
    it('only unshifts an array', function() {
      expect(update.bind(null, [], {$unshift: 7})).toThrow(
        'update(): expected spec of $unshift to be an array; got 7. Did you ' +
        'forget to wrap your parameter in an array?'
      );
    });
    it('only unshifts unto an array', function() {
      expect(update.bind(null, 1, {$unshift: 7})).toThrow(
        'update(): expected target of $unshift to be an array; got 1.'
      );
    });
    it('keeps reference equality when possible', function() {
      var original = ['x'];
      expect(update(original, {$unshift: []})).toBe(original)
    });
  });

  describe('$splice', function() {
    it('splices', function() {
      expect(update([1, 4, 3], {$splice: [[1, 1, 2]]})).toEqual([1, 2, 3]);
    });
    it('does not mutate the original object', function() {
      var obj = [1, 4, 3];
      update(obj, {$splice: [[1, 1, 2]]});
      expect(obj).toEqual([1, 4, 3]);
    });
    it('only splices an array of arrays', function() {
      expect(update.bind(null, [], {$splice: 1})).toThrow(
        'update(): expected spec of $splice to be an array of arrays; got 1. ' +
        'Did you forget to wrap your parameters in an array?'
      );
      expect(update.bind(null, [], {$splice: [1]})).toThrow(
        'update(): expected spec of $splice to be an array of arrays; got 1. ' +
        'Did you forget to wrap your parameters in an array?'
      );
    });
    it('only splices unto an array', function() {
      expect(update.bind(null, 1, {$splice: 7})).toThrow(
        'Expected $splice target to be an array; got 1'
      );
    });
    it('keeps reference equality when possible', function() {
      var original = ['x'];
      expect(update(original, {$splice: [[]]})).toBe(original)
    });
  });

  describe('$merge', function() {
    it('merges', function() {
      expect(update({a: 'b'}, {$merge: {c: 'd'}})).toEqual({a: 'b', c: 'd'});
    });
    it('does not mutate the original object', function() {
      var obj = {a: 'b'};
      update(obj, {$merge: {c: 'd'}});
      expect(obj).toEqual({a: 'b'});
    });
    it('only merges with an object', function() {
      expect(update.bind(null, {}, {$merge: 7})).toThrow(
        'update(): $merge expects a spec of type \'object\'; got 7'
      );
    });
    it('only merges with an object', function() {
      expect(update.bind(null, 7, {$merge: {a: 'b'}})).toThrow(
        'update(): $merge expects a target of type \'object\'; got 7'
      );
    });
    it('keeps reference equality when possible', function() {
      var original = {a: {b: {c: true}}};
      expect(update(original, {a: {$merge: {}}})).toBe(original);
      expect(update(original, {a: {$merge: { b: original.a.b }}})).toBe(original);

      // Merging primatives of the same value should return the original.
      expect(update(original, {a: {b: { $merge: {c: true} }}})).toBe(original);

      // Two objects are different values even though they are deeply equal.
      expect(update(original, {a: {$merge: { b: {c: true} }}})).toNotBe(original);
      expect(update(original, {
        a: {$merge: { b: original.a.b, c: false }}
      })).toNotBe(original);
    });

  });

  describe('$set', function() {
    it('sets', function() {
      expect(update({a: 'b'}, {$set: {c: 'd'}})).toEqual({c: 'd'});
    });
    it('does not mutate the original object', function() {
      var obj = {a: 'b'};
      update(obj, {$set: {c: 'd'}});
      expect(obj).toEqual({a: 'b'});
    });
    it('keeps reference equality when possible', function() {
      var original = {a: 1};
      expect(update(original, {a: {$set: 1}})).toBe(original);
      expect(update(original, {a: {$set: 2}})).toNotBe(original);
    });
    it('setting a property to undefined should add an enumerable key to final object with value undefined', function() {
      var original = {a: 1};
      var result = update(original, {b: {$set: undefined}});
      expect(result).toNotBe(original);
      expect(result).toEqual({a: 1, b: undefined});
      expect(Object.keys(result).length).toEqual(2);
    });
  });

  describe('$toggle', function() {
    it('only takes an array as spec', function() {
      expect(update.bind(null, {a: false}, {$toggle: 'a'})).toThrow(
        'update(): expected spec of $toggle to be an array; got a. Did you ' +
        'forget to wrap your parameter in an array?'
      );
    });
    it('toggles false to true and true to false', function() {
      expect(update({a: false, b: true}, {$toggle: ['a', 'b']})).toEqual({a: true, b: false});
    });
    it('does not mutate the original object', function() {
      var obj = {a: false};
      update(obj, {$toggle: ['a']});
      expect(obj).toEqual({a: false});
    });
    it('keeps reference equality when possible', function() {
      var original = {a: false};
      expect(update(original, {$toggle: []})).toBe(original);
      expect(update(original, {$toggle: ['a']})).toNotBe(original);
    });
  });

  describe('$unset', function() {
    it('unsets', function() {
      expect(update({a: 'b'}, {$unset: ['a']}).a).toBe(undefined);
    });
    it('removes the key from the object', function() {
      var removed = update({a: 'b'}, {$unset: ['a']});
      expect('a' in removed).toBe(false);
    });
    it('removes multiple keys from the object', function() {
      var original = {a: 'b', c: 'd', e: 'f'};
      var removed = update(original, {$unset: ['a', 'e']});
      expect('a' in removed).toBe(false);
      expect('a' in original).toBe(true);
      expect('e' in removed).toBe(false);
      expect('e' in original).toBe(true);
    });
    it('does not remove keys from the inherited properties', function() {
      function Parent() { this.foo = 'Parent'; }
      function Child() {}
      Child.prototype = new Parent()
      var child = new Child();
      expect(update(child, {$unset: ['foo']}).foo).toEqual('Parent');
    });
    it('keeps reference equality when possible', function() {
      var original = {a: 1};
      expect(update(original, {$unset: ['b']})).toBe(original);
      expect(update(original, {$unset: ['a']})).toNotBe(original);
    });
  });

  describe('$add', function() {
    it('works on Map', function() {
      var state = new Map([[1, 2], [3, 4]]);
      var state2 = update(state, {$add: [[5, 6]]});
      expect(state2.get(1)).toEqual(2);
      expect(state2.get(5)).toEqual(6);
    });
    it('works on Set', function() {
      var state = new Set([1, 2, 3, 4]);
      var state2 = update(state, {$add: [5, 6]});
      expect(state2.has(1)).toBe(true);
      expect(state2.has(5)).toBe(true);
    });
    it('throws on a non Map or Set', function() {
      expect(update.bind(null, 2, {$add: [1]})).toThrow(
        'update(): $add expects a target of type Set or Map; got Number'
      );
    })
  });

  describe('$remove', function() {
    it('works on Map', function() {
      var state = new Map([[1, 2], [3, 4], [5, 6]]);
      var state2 = update(state, {$remove: [1, 5]});
      expect(state2.has(1)).toBe(false);
      expect(state2.has(3)).toBe(true);
      expect(state2.get(3)).toBe(4);
      expect(state2.has(6)).toBe(false);
    });
    it('works on Set', function() {
      var state = new Set([1, 2, 3, 4]);
      var state2 = update(state, {$remove: [2, 3]});
      expect(state2.has(1)).toBe(true);
      expect(state2.has(2)).toBe(false);
    });
    it('throws on a non Map or Set', function() {
      expect(update.bind(null, 2, {$remove: [1]})).toThrow(
        'update(): $remove expects a target of type Set or Map; got Number'
      );
    })
  });

  describe('$apply', function() {
    var applier = function(node) {
      return {v: node.v * 2};
    };
    it('applies', function() {
      expect(update({v: 2}, {$apply: applier})).toEqual({v: 4});
    });
    it('does not mutate the original object', function() {
      var obj = {v: 2};
      update(obj, {$apply: applier});
      expect(obj).toEqual({v: 2});
    });
    it('only applies a function', function() {
      expect(update.bind(null, 2, {$apply: 123})).toThrow(
        'update(): expected spec of $apply to be a function; got 123.'
      );
    });
    it('keeps reference equality when possible', function() {
      var original = {a: {b: {}}};
      function identity(val) {
        return val;
      }
      expect(update(original, {a: {$apply: identity}})).toBe(original);
      expect(update(original, {a: {$apply: applier}})).toNotBe(original);
    });
  });

  describe('direct apply', function() {
    var applier = function(node) {
      return {v: node.v * 2};
    };
    it('applies', function() {
      var doubler = function(value) {
        return value * 2;
      };
      expect(update({v: 2}, applier)).toEqual({v: 4});
      expect(update(2, doubler)).toEqual(4);
    });
    it('does not mutate the original object', function() {
      var obj = {v: 2};
      update(obj, applier);
      expect(obj).toEqual({v: 2});
    });
    it('keeps reference equality when possible', function() {
      var original = {a: {b: {}}};
      function identity(val) {
        return val;
      }
      expect(update(original, {a: identity})).toBe(original);
      expect(update(original, {a: applier})).toNotBe(original);
    });
  });

  describe('deep update', function() {
    it('works', function() {
      expect(update({
        a: 'b',
        c: {
          d: 'e',
          f: [1],
          g: [2],
          h: [3],
          i: {j: 'k'},
          l: 4,
          m: 'n',
        },
      }, {
        c: {
          d: {$set: 'm'},
          f: {$push: [5]},
          g: {$unshift: [6]},
          h: {$splice: [[0, 1, 7]]},
          i: {$merge: {n: 'o'}},
          l: {$apply: function(x) { return x * 2 }},
          m: function(x) { return x + x },
        },
      })).toEqual({
        a: 'b',
        c: {
          d: 'm',
          f: [1, 5],
          g: [6, 2],
          h: [7],
          i: {j: 'k', n: 'o'},
          l: 8,
          m: 'nn',
        },
      });
    });
    it('keeps reference equality when possible', function() {
      var original = {a: {b: 1}, c: {d: {e: 1}}};

      expect(update(original, {a: {b: {$set: 1}}})).toBe(original);
      expect(update(original, {a: {b: {$set: 1}}}).a).toBe(original.a);

      expect(update(original, {c: {d: {e: {$set: 1}}}})).toBe(original);
      expect(update(original, {c: {d: {e: {$set: 1}}}}).c).toBe(original.c);
      expect(update(original, {c: {d: {e: {$set: 1}}}}).c.d).toBe(original.c.d);

      expect(update(original, {
        a: {b: {$set: 1}},
        c: {d: {e: {$set: 1}}},
      })).toBe(original);
      expect(update(original, {
        a: {b: {$set: 1}},
        c: {d: {e: {$set: 1}}},
      }).a).toBe(original.a);
      expect(update(original, {
        a: {b: {$set: 1}},
        c: {d: {e: {$set: 1}}},
      }).c).toBe(original.c);
      expect(update(original, {
        a: {b: {$set: 1}},
        c: {d: {e: {$set: 1}}},
      }).c.d).toBe(original.c.d);

      expect(update(original, {a: {b: {$set: 2}}})).toNotBe(original);
      expect(update(original, {a: {b: {$set: 2}}}).a).toNotBe(original.a);
      expect(update(original, {a: {b: {$set: 2}}}).a.b).toNotBe(original.a.b);

      expect(update(original, {a: {b: {$set: 2}}}).c).toBe(original.c);
      expect(update(original, {a: {b: {$set: 2}}}).c.d).toBe(original.c.d);
    });
  });

  it('should accept array spec to modify arrays', function() {
    var original = {value: [{a: 0}]};
    var modified = update(original, {value: [{a: {$set: 1}}]});
    expect(modified).toEqual({value: [{a: 1}]});
  });

  it('should accept object spec to modify arrays', function() {
    var original = {value: [{a: 0}]};
    var modified = update(original, {value: {'0': {a: {$set: 1}}}});
    expect(modified).toEqual({value: [{a: 1}]});
  });

  it('should reject arrays except as values of specific commands', function() {
    var specs = [
      [],
      {a: []},
      {a: {$set: []}, b: [[]]},
    ];
    specs.forEach(function(spec) {
      expect(update.bind(null, {a: 'b'}, spec)).toThrow(
        'update(): You provided an invalid spec to update(). The spec ' +
        'may not contain an array except as the value of $set, $push, ' +
        '$unshift, $splice or any custom command allowing an array value.'
      );
    });
  });

  it('should reject non arrays from $unset', function() {
    expect(update.bind(null, {a: 'b'}, {$unset: 'a'})).toThrow(
      'update(): expected spec of $unset to be an array; got a. ' +
      'Did you forget to wrap your parameter in an array?'
    );
  });

  it('should require a plain object spec containing command(s)', function() {
    var specs = [
      null,
      false,
      {a: 'c'},
      {a: {b: 'c'}},
    ];
    specs.forEach(function(spec) {
      expect(update.bind(null, {a: 'b'}, spec)).toThrow(
        'update(): You provided an invalid spec to update(). The spec ' +
        'and every included key path must be plain objects containing one ' +
        'of the following commands: $push, $unshift, $splice, $set, $toggle, $unset, ' +
        '$add, $remove, $merge, $apply.'
      );
    });
  });

  it('should perform safe hasOwnProperty check', function() {
    expect(update({}, {'hasOwnProperty': {$set: 'a'}})).toEqual({
      'hasOwnProperty': 'a',
    });
  });

});


describe('update', function() {

  var myUpdate;
  beforeEach(function() {
    myUpdate = update.newContext();
  });

  describe('can extend functionality', function() {

    it('allows adding new directives', function() {
      myUpdate.extend('$addtax', function(tax, original) {
        return original + (tax * original);
      });
      expect(myUpdate(5, {$addtax: 0.10})).toEqual(5.5);
    });

    it('gets the original object (so be careful about mutations)', function() {
      var obj = {};
      var passedOriginal;
      myUpdate.extend('$foobar', function(prop, original) {
        passedOriginal = original;
      });
      myUpdate(obj, {$foobar: null});
      expect(obj).toBe(passedOriginal);
    });

    it("doesn't touch the original update", function() {
      myUpdate.extend('$addtax', function(tax, original) {
        return original + (tax * original);
      });
      expect(  update.bind(null, {$addtax: 0.10}, {$addtax: 0.10})).toThrow();
      expect(myUpdate.bind(null, {$addtax: 0.10}, {$addtax: 0.10})).toNotThrow();
    });

    it('can handle nibling directives', function() {
      var obj = {a: [1, 2, 3], b: "me"};
      var spec = {
        a: {$splice: [[0, 2]]},
        $merge: {b: "you"},
      };
      expect(update(obj, spec)).toEqual({"a":[3],"b":"you"});
    });

  });

  if (typeof Symbol === 'function' && Symbol('TEST').toString() === 'Symbol(TEST)') {
    describe('works with symbols', function() {
      it('in the source object', function() {
        var obj = {a: 1};
        obj[Symbol.for('b')] = 2;
        expect(update(obj, {c: {$set: 3}})[Symbol.for('b')]).toEqual(2);
      });
      it('in the spec object', function() {
        var obj = {a: 1};
        obj[Symbol.for('b')] = 2;
        var spec = {};
        spec[Symbol.for('b')] = {$set: 2};
        expect(update(obj, spec)[Symbol.for('b')]).toEqual(2);
      });
      it('in the $merge command', function() {
        var obj = {a: 1};
        obj[Symbol.for('b')] = {c: 3};
        obj[Symbol.for('d')] = 4;
        var spec = {};
        spec[Symbol.for('b')] = { $merge: {} };
        spec[Symbol.for('b')].$merge[Symbol.for('e')] = 5;
        var updated = update(obj, spec);
        expect(updated[Symbol.for('b')][Symbol.for('e')]).toEqual(5);
        expect(updated[Symbol.for('d')]).toEqual(4);
      });
    });
  }

  it('supports objects without prototypes', function() {
    var obj = Object.create(null);
    expect(update.bind(null, obj, {$merge: {a: 'b'}})).toNotThrow()
  });

  it('supports objects with prototypes', function() {
    var proto = { a: 'Proto' };
    var obj = Object.create(proto);
    expect(update(obj, { $merge: { b: 'Obj' } }).a).toEqual('Proto');
  });

  it('supports an escape hatch for isEquals', function() {
    myUpdate.isEquals = function(a, b) {
      return JSON.stringify(a) === JSON.stringify(b);
    }
    var a = {b: {c: {d: [4, 5]}}};
    var b = myUpdate(a, {b: {c: {d: {$set: [4, 5]}}}});
    var c = myUpdate(a, {b: {$set: {c: {d: [4, 5]}}}});
    var d = myUpdate(a, {$set: {b: {c: {d: [4, 5]}}}});
    expect(a).toBe(b)
    expect(a).toBe(c)
    expect(a).toBe(d)
  });

  it('supports an escape hatch for isEqual for shallow direct apply', function() {
    myUpdate.isEquals = function(a, b) {
      return JSON.stringify(a) === JSON.stringify(b);
    };
    var a = { b: 1 };
    var b = myUpdate(a, function() { return { b: 1 }; });
    expect(a).toBe(b);
  });

  it('does not lose non integer keys of an array', function() {
    var state = a = { items: [
      { name: 'Superman', strength: 1000 },
      { name: 'Jim', strength: 2 },
    ] };
    state.items.top = 0
    var state2 = update(state, { items: { 1: { strength: { $set: 3 } } } });
    expect(state2.items.top).toBe(0)
  });

  it('supports Maps', function() {
    var state = new Map([
      ['mapKey', 'mapValue']
    ]);

    var updatedState = update(state, {
      ['mapKey']: {$set: 'updatedMapValue' }
    });

    expect(updatedState).toEqual(
      new Map([
        ['mapKey', 'updatedMapValue']
      ])
    );
  });

  it('supports nested objects inside Maps', function () {
    var state = new Map([
      ['mapKey', { banana: 'yellow', apple: ['red'], blueberry: 'purple' }]
    ]);

    var updatedState = update(state, {
      ['mapKey']: { apple: { $set: ['green', 'red'] } }
    });

    expect(updatedState).toEqual(
      new Map([
        [
          'mapKey',
          { banana: 'yellow', apple: ['green', 'red'], blueberry: 'purple' }
        ]
      ])
    );
  });

  it('supports Maps and keeps reference equality when possible', function() {
    var original = new Map([['a', { b: 1 }]]);
    expect(update(original, { a: { $merge: {} } })).toBe(original);
    expect(update(original, { a: { $merge: { c: 2 } } })).toNotBe(original);
  });

});
