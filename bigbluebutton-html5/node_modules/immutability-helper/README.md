immutability-helper
===

[![NPM version][npm-image]][npm-url]
[![Build status][travis-image]][travis-url]
[![Test coverage][coveralls-image]][coveralls-url]
[![Downloads][downloads-image]][downloads-url]

Mutate a copy of data without changing the original source

Setup via NPM
```sh
npm install immutability-helper --save
```

This is a drop-in replacement for [`react-addons-update`](https://facebook.github.io/react/docs/update.html):
```js
// import update from 'react-addons-update';
import update from 'immutability-helper';

const state1 = ['x'];
const state2 = update(state1, {$push: ['y']}); // ['x', 'y']
```

Note that this module has nothing to do with React. However, since this module
is most commonly used with React, the docs will focus on how it can be used with
React.

## Overview

React lets you use whatever style of data management you want, including
mutation. However, if you can use immutable data in performance-critical parts
of your application it's easy to implement a fast[`shouldComponentUpdate()`](https://facebook.github.io/react/docs/react-component.html#shouldcomponentupdate) method
to significantly speed up your app.

Dealing with immutable data in JavaScript is more difficult than in languages
designed for it, like [Clojure](http://clojure.org/). However, we've provided a
simple immutability helper, `update()`, that makes dealing with this type of
data much easier, *without* fundamentally changing how your data is represented.
You can also take a look at Facebook's
[Immutable.js](https://facebook.github.io/immutable-js/docs/) and React’s
[Using Immutable Data Structures](https://facebook.github.io/react/docs/optimizing-performance.html#using-immutable-data-structures) section for more
detail on Immutable.js.

### The Main Idea

If you mutate data like this:

```js
myData.x.y.z = 7;
// or...
myData.a.b.push(9);
```

You have no way of determining which data has changed since the previous copy
has been overwritten. Instead, you need to create a new copy of `myData` and
change only the parts of it that need to be changed. Then you can compare the
old copy of `myData` with the new one in `shouldComponentUpdate()` using
triple-equals:

```js
const newData = deepCopy(myData);
newData.x.y.z = 7;
newData.a.b.push(9);
```

Unfortunately, deep copies are expensive, and sometimes impossible. You can
alleviate this by only copying objects that need to be changed and by reusing
the objects that haven't changed. Unfortunately, in today's JavaScript this can
be cumbersome:

```js
const newData = extend(myData, {
  x: extend(myData.x, {
    y: extend(myData.x.y, {z: 7}),
  }),
  a: extend(myData.a, {b: myData.a.b.concat(9)})
});
```

While this is fairly performant (since it only makes a shallow copy of `log n`
objects and reuses the rest), it's a big pain to write. Look at all the
repetition! This is not only annoying, but also provides a large surface area
for bugs.

## `update()`

`update()` provides simple syntactic sugar around this pattern to make writing
this code easier. This code becomes:

```js
import update from 'immutability-helper';

const newData = update(myData, {
  x: {y: {z: {$set: 7}}},
  a: {b: {$push: [9]}}
});
```

While the syntax takes a little getting used to (though it's inspired by
[MongoDB's query language](http://docs.mongodb.org/manual/core/crud-introduction/#query)) there's no redundancy, it's statically analyzable and it's not much more typing
than the mutative version.

The `$`-prefixed keys are called *commands*. The data structure they are
"mutating" is called the *target*.

## Available Commands

  * `{$push: array}` `push()` all the items in `array` on the target.
  * `{$unshift: array}` `unshift()` all the items in `array` on the target.
  * `{$splice: array of arrays}` for each item in `arrays` call `splice()` on
  the target with the parameters provided by the item. ***Note:** The items in
  the array are applied sequentially, so the order matters. The indices of the
  target may change during the operation.*
  * `{$set: any}` replace the target entirely.
  * `{$toggle: array of strings}` toggles a list of boolean fields from the
  target object.
  * `{$unset: array of strings}` remove the list of keys in `array` from the
  target object.
  * `{$merge: object}` merge the keys of `object` with the target.
  * `{$apply: function}` passes in the current value to the function and
  updates it with the new returned value.
  * `{$add: array of objects}` add a value to a `Map` or `Set`. When adding to a
  `Set` you pass in an array of objects to add, when adding to a Map, you pass
  in `[key, value]` arrays like so:
  `update(myMap, {$add: [['foo', 'bar'], ['baz', 'boo']]})`
  * `{$remove: array of strings}` remove the list of keys in array from a `Map`
  or `Set`.

### Shorthand `$apply` syntax

Additionally, instead of a command object, you can pass a function, and it will
be treated as if it was a command object with the `$apply` command:
`update({a: 1}, {a: function})`. That example would be equivalent to
`update({a: 1}, {a: {$apply: function}})`.

## Examples

### Simple push

```js
const initialArray = [1, 2, 3];
const newArray = update(initialArray, {$push: [4]}); // => [1, 2, 3, 4]
```
`initialArray` is still `[1, 2, 3]`.

### Nested collections

```js
const collection = [1, 2, {a: [12, 17, 15]}];
const newCollection = update(collection, {2: {a: {$splice: [[1, 1, 13, 14]]}}});
// => [1, 2, {a: [12, 13, 14, 15]}]
```
This accesses `collection`'s index `2`, key `a`, and does a splice of one item
starting from index `1` (to remove `17`) while inserting `13` and `14`.

### Updating a value based on its current one

```js
const obj = {a: 5, b: 3};
const newObj = update(obj, {b: {$apply: function(x) {return x * 2;}}});
// => {a: 5, b: 6}
// This is equivalent, but gets verbose for deeply nested collections:
const newObj2 = update(obj, {b: {$set: obj.b * 2}});
```

### (Shallow) Merge

```js
const obj = {a: 5, b: 3};
const newObj = update(obj, {$merge: {b: 6, c: 7}}); // => {a: 5, b: 6, c: 7}
```

### Computed Property Names

Arrays can be indexed into with runtime variables via the ES2015
[Computed Property Names](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer#Computed_property_names)
feature. An object property name expression may be wrapped in brackets [] which
will be evaluated at runtime to form the final property name.

```js
const collection = {children: ['zero', 'one', 'two']};
const index = 1;
const newCollection = update(collection, {children: {[index]: {$set: 1}}});
// => {children: ['zero', 1, 'two']}
```

### [Autovivification](https://en.wikipedia.org/wiki/Autovivification)

Autovivification is the auto creation of new arrays and objects when needed. In
the context of javascript that would mean something like this

```js
const state = {}
state.a.b.c = 1; // state would equal { a: { b: { c: 1 } } }
```

Since javascript doesn't have this "feature", the same applies to
`immutability-helper`. The reason why this is practically impossible in
javascript and by extension `immutability-helper` is the following:

```js
var state = {}
state.thing[0] = 'foo' // What type should state.thing have? Should it be an object or array?
state.thing2[1] = 'foo2' // What about thing2? This must be an object!
state.thing3 = ['thing3'] // This is regular js, this works without autovivification
state.thing3[1] = 'foo3' // Hmm, notice that state.thing2 is an object, yet this is an array
state.thing2.slice // should be undefined
state.thing2.slice // should be a function
```

If you need to set something deeply nested and don't want to have to set each
layer down the line, consider using this technique which is shown with a
contrived example:

```js
var state = {}
var desiredState = {
  foo: [
    {
      bar: ['x', 'y', 'z']
    },
  ],
};

const state2 = update(state, {
  foo: foo =>
    update(foo || [], {
      0: fooZero =>
        update(fooZero || {}, {
          bar: bar => update(bar || [], { $push: ["x", "y", "z"] })
        })
    })
});

console.log(JSON.stringify(state2) === JSON.stringify(desiredState)) // true
// note that state could have been declared as any of the following and it would still output true:
// var state = { foo: [] }
// var state = { foo: [ {} ] }
// var state = { foo: [ {bar: []} ] }
```

You can also choose to use the extend functionality to add an `$auto` and
`$autoArray` command:

```js
update.extend('$auto', function(value, object) {
  return object ?
    update(object, value):
    update({}, value);
});
update.extend('$autoArray', function(value, object) {
  return object ?
    update(object, value):
    update([], value);
});

var state = {}
var desiredState = {
  foo: [
    {
      bar: ['x', 'y', 'z']
    },
  ],
};
var state2 = update(state, {
  foo: {$autoArray: {
    0: {$auto: {
      bar: {$autoArray: {$push: ['x', 'y', 'z']}}
    }}
  }}
});
console.log(JSON.stringify(state2) === JSON.stringify(desiredState)) // true
```

---

## Adding your own commands

The main difference this module has with `react-addons-update` is that
you can extend this to give it more functionality:

```js
update.extend('$addtax', function(tax, original) {
  return original + (tax * original);
});
const state = { price: 123 };
const withTax = update(state, {
  price: {$addtax: 0.8},
});
assert(JSON.stringify(withTax) === JSON.stringify({ price: 221.4 }));
```

Note that `original` in the function above is the original object, so if you
plan making a mutation, you must first shallow clone the object. Another option
is to use `update` to make the change
`return update(original, { foo: {$set: 'bar'} })`

If you don't want to mess around with the globally exported `update` function
you can make a copy and work with that copy:

```js
import { newContext } from 'immutability-helper';
const myUpdate = newContext();
myUpdate.extend('$foo', function(value, original) {
  return 'foo!';
});
```

[npm-image]: https://img.shields.io/npm/v/immutability-helper.svg?style=flat-square
[npm-url]: https://npmjs.org/package/immutability-helper
[travis-image]: https://img.shields.io/travis/kolodny/immutability-helper.svg?style=flat-square
[travis-url]: https://travis-ci.org/kolodny/immutability-helper
[coveralls-image]: https://img.shields.io/coveralls/kolodny/immutability-helper.svg?style=flat-square
[coveralls-url]: https://coveralls.io/r/kolodny/immutability-helper
[downloads-image]: http://img.shields.io/npm/dm/immutability-helper.svg?style=flat-square
[downloads-url]: https://npmjs.org/package/immutability-helper
