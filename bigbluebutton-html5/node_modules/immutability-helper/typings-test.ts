// tslint:disable-next-line:no-implicit-dependencies
import update, { CustomCommands } from "immutability-helper";

interface TestObject {
  number: number;
  object: {
    field: number;
    otherField: string;
  };
  array: string[];
  set: Set<string>;
  map: Map<string, number>;
  union: Set<string> | Map<string, number>;
  intersection: string[] & {
    field: number;
  };
  complicated: {
    array: Array<{
      nestedArray: Array<{
        field: string;
        otherField: {
          reallyNestedField: string;
          anotherReallyNestedField: number;
        };
      }>;
      map: Map<
        { key: string; extraneousKeyField: string; },
        { value: number; }
      >;
    }>;
  };
}

const o: TestObject = null as any;

// ----------------------------------------------------------------------------
// Basic Tests
// ----------------------------------------------------------------------------

// $ExpectType TestObject
update(o, {});

// $ExpectType TestObject
update(o, {
  number: {
    $set: 1
  }
});

// $ExpectError
update(o, {
  number: {
    $set: "string"
  }
});

// $ExpectType TestObject
update(o, {
  object: {
    $set: {
      field: 1,
      otherField: "string",
    }
  }
});

// $ExpectError
update(o, {
  object: {
    $set: {
      notAField: 1
    }
  }
});

// $ExpectType TestObject
update(o, {
  object: {
    $apply: () => ({
      field: 1,
      otherField: "string"
    })
  }
});

// $ExpectError
update(o, {
  object: {
    $apply: () => ({
      notAField: 1
    })
  }
});

// $ExpectType TestObject
update(o, {
  object: () => ({
    field: 1,
    otherField: "string"
  })
});

// $ExpectError
update(o, {
  object: () => ({
    notAField: 1
  })
});

// ----------------------------------------------------------------------------
// Object Tests
// ----------------------------------------------------------------------------

// $ExpectType TestObject
update(o, {
  object: {
    field: {
      $set: 1
    }
  }
});

// $ExpectError
update(o, {
  object: {
    field: {
      $set: "string"
    }
  }
});

// $ExpectError
update(o, {
  object: {
    notAField: {
      $set: "string"
    }
  }
});

// This tests represents the loophole that if any part of your spec matches the object spec,
// extraneous fields that don't make sense are ignored.
//
// I believe this is because mapped types that include optionality are subject to one of the
// "object literal typecheck" heuristic, specifically, if there are zero compatible fields it's
// an error but if there is at least one then extraneous fields are permitted.
// $ExpectType TestObject
update(o, {
  object: {
    field: {
      $set: 1
    },
    notAField: "nonsense"
  }
});

// $ExpectType TestObject
update(o, {
  object: {
    $unset: [ "field" ],
  }
});

// $ExpectError
update(o, {
  object: {
    $unset: [ "notAField" ],
  }
});

// $ExpectType TestObject
update(o, {
  object: {
    $toggle: [ "field" ],
  }
});

// $ExpectError
update(o, {
  object: {
    $toggle: [ "notAField" ],
  }
});

// $ExpectType TestObject
update(o, {
  object: {
    $merge: {
      field: 1,
    },
  }
});

// $ExpectError
update(o, {
  object: {
    $merge: {
      notAField: 1,
    },
  }
});

// ----------------------------------------------------------------------------
// Array Tests
// ----------------------------------------------------------------------------

// $ExpectType TestObject
update(o, {
  array: {
    $push: ["string"]
  }
});

// $ExpectError
update(o, {
  array: {
    $push: [1]
  }
});

// $ExpectType TestObject
update(o, {
  array: {
    $unshift: ["string"]
  }
});

// $ExpectError
update(o, {
  array: {
    $unshift: [1]
  }
});

// $ExpectType TestObject
update(o, {
  array: {
    $splice: [ [ 1 ] ]
  }
});

// $ExpectType TestObject
update(o, {
  array: {
    $splice: [ [ 1, 2 ] ]
  }
});

// $ExpectType TestObject
update(o, {
  array: {
    $splice: [ [ 1, 2, "string" ] ]
  }
});

// $ExpectError
update(o, {
  array: {
    $splice: "string"
  }
});

// $ExpectError
update(o, {
  array: {
    $splice: [ [ 1, 2, null ] ]
  }
});

// $ExpectType TestObject
update(o, {
  array: {
    1: {
      $set: "string"
    }
  }
});

// $ExpectError
update(o, {
  array: {
    1: {
      $set: 1
    }
  }
});

// $ExpectType TestObject
update(o, {
  array: {
    [1]: {
      $set: "string"
    }
  }
});

// $ExpectType TestObject
update(o, {
  array: {
    ['1']: {
      $set: "string"
    }
  }
});

// TODO: This test should not pass, but it's because ArraySpec has [index: string]. Changing that
// to [index: number] fails many more tests by being too permissive, so I figure this is the
// preferable error to accept. I do not know why [index: number] would cause the types to be
// permissive to the point of uselessness.
// $ExpectType TestObject
update(o, {
  array: {
    uhOh: {
      $set: "string"
    }
  }
});

// This test passes (i.e., doesn't type check), but for the wrong reasons. See the previous test
// for details.
// $ExpectError
update(o, {
  array: {
    uhOh: {
      $set: 1
    }
  }
});

// ----------------------------------------------------------------------------
// Set Tests
// ----------------------------------------------------------------------------

// $ExpectType TestObject
update(o, {
  set: {
    $add: [ "string" ]
  }
});

// $ExpectError
update(o, {
  set: {
    $add: [ 1 ]
  }
});

// $ExpectType TestObject
update(o, {
  set: {
    $remove: [ "string" ]
  }
});

// $ExpectError
update(o, {
  set: {
    $remove: [ 1 ]
  }
});

// ----------------------------------------------------------------------------
// Map Tests
// ----------------------------------------------------------------------------

// $ExpectType TestObject
update(o, {
  map: {
    $add: [ [ "string", 1 ] ]
  }
});

// $ExpectError
update(o, {
  map: {
    $add: [ [ 1, 1 ] ]
  }
});

// $ExpectType TestObject
update(o, {
  map: {
    $remove: [ "string" ]
  }
});

// $ExpectError
update(o, {
  map: {
    $remove: [ 1 ]
  }
});

// ----------------------------------------------------------------------------
// Union Type Tests
// ----------------------------------------------------------------------------

// $ExpectType TestObject
update(o, {
  union: {
    $set: new Set(),
  }
});

// $ExpectType TestObject
update(o, {
  union: {
    $set: new Map(),
  }
});

// Matches the Set variant.
// $ExpectType TestObject
update(o, {
  union: {
    $add: [ "string" ]
  }
});

// Matches the Map variant.
// $ExpectType TestObject
update(o, {
  union: {
    $add: [ [ "string", 1 ] ]
  }
});

// $ExpectError
update(o, {
  union: {
    $add: [ [ "string", "string" ] ]
  }
});

// Matches both the Set and Map variants.
// $ExpectType TestObject
update(o, {
  union: {
    $remove: [ "string" ]
  }
});

// $ExpectError
update(o, {
  union: {
    $remove: 1
  }
});

// ----------------------------------------------------------------------------
// Intersection Type Tests
// ----------------------------------------------------------------------------

const intersected: string[] & { field: number } = null as any;

// $ExpectType TestObject
update(o, {
  intersection: {
    $set: intersected
  }
});

// $ExpectError
update(o, {
  intersection: {
    $set: []
  }
});

// $ExpectError
update(o, {
  intersection: {
    $set: {
      field: 1
    }
  }
});

// Matches the object half but not the array half.
// This fails to type check because object specs are only allowed if there is no more-specific spec
// that matches. In this case, the array spec matches, so we don't get the object-related features.
// This is arguably a bug, but this is a pretty strange type so we should be okay not supporting it.
// $ExpectError
update(o, {
  intersection: {
    field: {
      $set: 1
    }
  }
});

// Matches the array half but not the object half.
// $ExpectType TestObject
update(o, {
  intersection: {
    $unshift: ["string"]
  }
});

// ----------------------------------------------------------------------------
// Complex Spec Tests
// ----------------------------------------------------------------------------

// $ExpectType TestObject
update(o, {
  complicated: {
    array: {
      1: {
        nestedArray: {
          1: {
            field: {
              $set: "string"
            },
            otherField: {
              $merge: {
                anotherReallyNestedField: 1
              }
            }
          }
        },
        map: {
          $add: [[
            { key: "string", extraneousKeyField: "string" },
            { value: 1 }
          ]]
        }
      }
    }
  }
});

// ----------------------------------------------------------------------------
// Custom Commands Tests
// ----------------------------------------------------------------------------

type TestCustomCommands = CustomCommands<{ $foo: string }>;

// $ExpectType TestObject
update<TestObject, TestCustomCommands>(o, {
  object: {
    field: {
      $foo: "string"
    }
  }
});

// $ExpectError
update<TestObject, TestCustomCommands>(o, {
  object: {
    field: {
      $foo: 1
    }
  }
});
