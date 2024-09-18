'use strict';

/*
 * Copyright 2009 Google Inc., 2011 Peter 'Pita' Martischka (Primary Technology Ltd)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/*
 * This is the Changeset library copied from the old Etherpad with some modifications
 * to use it in node.js. The original can be found at:
 * https://github.com/ether/pad/blob/master/infrastructure/ace/www/easysync2.js
 */

const AttributeMap = require('./AttributeMap');
const AttributePool = require('./AttributePool');
const attributes = require('./attributes');

/**
 * A `[key, value]` pair of strings describing a text attribute.
 *
 * @typedef {[string, string]} Attribute
 */

/**
 * A concatenated sequence of zero or more attribute identifiers, each one represented by an
 * asterisk followed by a base-36 encoded attribute number.
 *
 * Examples: '', '*0', '*3*j*z*1q'
 *
 * @typedef {string} AttributeString
 */

/**
 * This method is called whenever there is an error in the sync process.
 *
 * @param {string} msg - Just some message
 */
const error = (msg) => {
  const e = new Error(msg);
  e.easysync = true;
  throw e;
};

/**
 * Assert that a condition is truthy. If the condition is falsy, the `error` function is called to
 * throw an exception.
 *
 * @param {boolean} b - assertion condition
 * @param {string} msg - error message to include in the exception
 * @type {(b: boolean, msg: string) => asserts b}
 */
const assert = (b, msg) => {
  if (!b) error(`Failed assertion: ${msg}`);
};

/**
 * Parses a number from string base 36.
 *
 * @param {string} str - string of the number in base 36
 * @returns {number} number
 */
exports.parseNum = (str) => parseInt(str, 36);

/**
 * Writes a number in base 36 and puts it in a string.
 *
 * @param {number} num - number
 * @returns {string} string
 */
exports.numToString = (num) => num.toString(36).toLowerCase();

/**
 * An operation to apply to a shared document.
 */
class Op {
  /**
   * @param {(''|'='|'+'|'-')} [opcode=''] - Initial value of the `opcode` property.
   */
  constructor(opcode = '') {
    /**
     * The operation's operator:
     *   - '=': Keep the next `chars` characters (containing `lines` newlines) from the base
     *     document.
     *   - '-': Remove the next `chars` characters (containing `lines` newlines) from the base
     *     document.
     *   - '+': Insert `chars` characters (containing `lines` newlines) at the current position in
     *     the document. The inserted characters come from the changeset's character bank.
     *   - '' (empty string): Invalid operator used in some contexts to signifiy the lack of an
     *     operation.
     *
     * @type {(''|'='|'+'|'-')}
     * @public
     */
    this.opcode = opcode;

    /**
     * The number of characters to keep, insert, or delete.
     *
     * @type {number}
     * @public
     */
    this.chars = 0;

    /**
     * The number of characters among the `chars` characters that are newlines. If non-zero, the
     * last character must be a newline.
     *
     * @type {number}
     * @public
     */
    this.lines = 0;

    /**
     * Identifiers of attributes to apply to the text, represented as a repeated (zero or more)
     * sequence of asterisk followed by a non-negative base-36 (lower-case) integer. For example,
     * '*2*1o' indicates that attributes 2 and 60 apply to the text affected by the operation. The
     * identifiers come from the document's attribute pool.
     *
     * For keep ('=') operations, the attributes are merged with the base text's existing
     * attributes:
     *   - A keep op attribute with a non-empty value replaces an existing base text attribute that
     *     has the same key.
     *   - A keep op attribute with an empty value is interpreted as an instruction to remove an
     *     existing base text attribute that has the same key, if one exists.
     *
     * This is the empty string for remove ('-') operations.
     *
     * @type {string}
     * @public
     */
    this.attribs = '';
  }

  toString() {
    if (!this.opcode) throw new TypeError('null op');
    if (typeof this.attribs !== 'string') throw new TypeError('attribs must be a string');
    const l = this.lines ? `|${exports.numToString(this.lines)}` : '';
    return this.attribs + l + this.opcode + exports.numToString(this.chars);
  }
}
exports.Op = Op;

/**
 * Describes changes to apply to a document. Does not include the attribute pool or the original
 * document.
 *
 * @typedef {object} Changeset
 * @property {number} oldLen - The length of the base document.
 * @property {number} newLen - The length of the document after applying the changeset.
 * @property {string} ops - Serialized sequence of operations. Use `deserializeOps` to parse this
 *     string.
 * @property {string} charBank - Characters inserted by insert operations.
 */

/**
 * Returns the required length of the text before changeset can be applied.
 *
 * @param {string} cs - String representation of the Changeset
 * @returns {number} oldLen property
 */
exports.oldLen = (cs) => exports.unpack(cs).oldLen;

/**
 * Returns the length of the text after changeset is applied.
 *
 * @param {string} cs - String representation of the Changeset
 * @returns {number} newLen property
 */
exports.newLen = (cs) => exports.unpack(cs).newLen;

/**
 * Parses a string of serialized changeset operations.
 *
 * @param {string} ops - Serialized changeset operations.
 * @yields {Op}
 * @returns {Generator<Op>}
 */
exports.deserializeOps = function* (ops) {
  // TODO: Migrate to String.prototype.matchAll() once there is enough browser support.
  const regex = /((?:\*[0-9a-z]+)*)(?:\|([0-9a-z]+))?([-+=])([0-9a-z]+)|(.)/g;
  let match;
  while ((match = regex.exec(ops)) != null) {
    if (match[5] === '$') return; // Start of the insert operation character bank.
    if (match[5] != null) error(`invalid operation: ${ops.slice(regex.lastIndex - 1)}`);
    const op = new Op(match[3]);
    op.lines = exports.parseNum(match[2] || '0');
    op.chars = exports.parseNum(match[4]);
    op.attribs = match[1];
    yield op;
  }
};

/**
 * Iterator over a changeset's operations.
 *
 * Note: This class does NOT implement the ECMAScript iterable or iterator protocols.
 *
 * @deprecated Use `deserializeOps` instead.
 */
class OpIter {
  /**
   * @param {string} ops - String encoding the change operations to iterate over.
   */
  constructor(ops) {
    this._gen = exports.deserializeOps(ops);
    this._next = this._gen.next();
  }

  /**
   * @returns {boolean} Whether there are any remaining operations.
   */
  hasNext() {
    return !this._next.done;
  }

  /**
   * Returns the next operation object and advances the iterator.
   *
   * Note: This does NOT implement the ECMAScript iterator protocol.
   *
   * @param {Op} [opOut] - Deprecated. Operation object to recycle for the return value.
   * @returns {Op} The next operation, or an operation with a falsy `opcode` property if there are
   *     no more operations.
   */
  next(opOut = new Op()) {
    if (this.hasNext()) {
      copyOp(this._next.value, opOut);
      this._next = this._gen.next();
    } else {
      clearOp(opOut);
    }
    return opOut;
  }
}

/**
 * Creates an iterator which decodes string changeset operations.
 *
 * @deprecated Use `deserializeOps` instead.
 * @param {string} opsStr - String encoding of the change operations to perform.
 * @returns {OpIter} Operator iterator object.
 */
exports.opIterator = (opsStr) => {
  padutils.warnDeprecated(
      'Changeset.opIterator() is deprecated; use Changeset.deserializeOps() instead');
  return new OpIter(opsStr);
};

/**
 * Cleans an Op object.
 *
 * @param {Op} op - object to clear
 */
const clearOp = (op) => {
  op.opcode = '';
  op.chars = 0;
  op.lines = 0;
  op.attribs = '';
};

/**
 * Creates a new Op object
 *
 * @deprecated Use the `Op` class instead.
 * @param {('+'|'-'|'='|'')} [optOpcode=''] - The operation's operator.
 * @returns {Op}
 */
exports.newOp = (optOpcode) => {
  padutils.warnDeprecated('Changeset.newOp() is deprecated; use the Changeset.Op class instead');
  return new Op(optOpcode);
};

/**
 * Copies op1 to op2
 *
 * @param {Op} op1 - src Op
 * @param {Op} [op2] - dest Op. If not given, a new Op is used.
 * @returns {Op} `op2`
 */
const copyOp = (op1, op2 = new Op()) => Object.assign(op2, op1);

/**
 * Serializes a sequence of Ops.
 *
 * @typedef {object} OpAssembler
 * @property {Function} append -
 * @property {Function} clear -
 * @property {Function} toString -
 */

/**
 * Efficiently merges consecutive operations that are mergeable, ignores no-ops, and drops final
 * pure "keeps". It does not re-order operations.
 *
 * @typedef {object} MergingOpAssembler
 * @property {Function} append -
 * @property {Function} clear -
 * @property {Function} endDocument -
 * @property {Function} toString -
 */

/**
 * Generates operations from the given text and attributes.
 *
 * @param {('-'|'+'|'=')} opcode - The operator to use.
 * @param {string} text - The text to remove/add/keep.
 * @param {(Iterable<Attribute>|AttributeString)} [attribs] - The attributes to insert into the pool
 *     (if necessary) and encode. If an attribute string, no checking is performed to ensure that
 *     the attributes exist in the pool, are in the canonical order, and contain no duplicate keys.
 *     If this is an iterable of attributes, `pool` must be non-null.
 * @param {?AttributePool} pool - Attribute pool. Required if `attribs` is an iterable of
 *     attributes, ignored if `attribs` is an attribute string.
 * @yields {Op} One or two ops (depending on the presense of newlines) that cover the given text.
 * @returns {Generator<Op>}
 */
const opsFromText = function* (opcode, text, attribs = '', pool = null) {
  const op = new Op(opcode);
  op.attribs = typeof attribs === 'string'
    ? attribs : new AttributeMap(pool).update(attribs || [], opcode === '+').toString();
  const lastNewlinePos = text.lastIndexOf('\n');
  if (lastNewlinePos < 0) {
    op.chars = text.length;
    op.lines = 0;
    yield op;
  } else {
    op.chars = lastNewlinePos + 1;
    op.lines = text.match(/\n/g).length;
    yield op;
    const op2 = copyOp(op);
    op2.chars = text.length - (lastNewlinePos + 1);
    op2.lines = 0;
    yield op2;
  }
};

/**
 * @returns {SmartOpAssembler}
 */
exports.smartOpAssembler = () => {
  const minusAssem = exports.mergingOpAssembler();
  const plusAssem = exports.mergingOpAssembler();
  const keepAssem = exports.mergingOpAssembler();
  const assem = exports.stringAssembler();
  let lastOpcode = '';
  let lengthChange = 0;

  const flushKeeps = () => {
    assem.append(keepAssem.toString());
    keepAssem.clear();
  };

  const flushPlusMinus = () => {
    assem.append(minusAssem.toString());
    minusAssem.clear();
    assem.append(plusAssem.toString());
    plusAssem.clear();
  };

  const append = (op) => {
    if (!op.opcode) return;
    if (!op.chars) return;

    if (op.opcode === '-') {
      if (lastOpcode === '=') {
        flushKeeps();
      }
      minusAssem.append(op);
      lengthChange -= op.chars;
    } else if (op.opcode === '+') {
      if (lastOpcode === '=') {
        flushKeeps();
      }
      plusAssem.append(op);
      lengthChange += op.chars;
    } else if (op.opcode === '=') {
      if (lastOpcode !== '=') {
        flushPlusMinus();
      }
      keepAssem.append(op);
    }
    lastOpcode = op.opcode;
  };

  const toString = () => {
    flushPlusMinus();
    flushKeeps();
    return assem.toString();
  };

  const clear = () => {
    minusAssem.clear();
    plusAssem.clear();
    keepAssem.clear();
    assem.clear();
    lengthChange = 0;
  };

  const endDocument = () => {
    keepAssem.endDocument();
  };

  const getLengthChange = () => lengthChange;

  return {
    append,
    toString,
    clear,
    endDocument,
    getLengthChange,
  };
};

/**
 * @returns {MergingOpAssembler}
 */
exports.mergingOpAssembler = () => {
  const assem = exports.opAssembler();
  const bufOp = new Op();

  // If we get, for example, insertions [xxx\n,yyy], those don't merge,
  // but if we get [xxx\n,yyy,zzz\n], that merges to [xxx\nyyyzzz\n].
  // This variable stores the length of yyy and any other newline-less
  // ops immediately after it.
  let bufOpAdditionalCharsAfterNewline = 0;

  /**
   * @param {boolean} [isEndDocument]
   */
  const flush = (isEndDocument) => {
    if (!bufOp.opcode) return;
    if (isEndDocument && bufOp.opcode === '=' && !bufOp.attribs) {
      // final merged keep, leave it implicit
    } else {
      assem.append(bufOp);
      if (bufOpAdditionalCharsAfterNewline) {
        bufOp.chars = bufOpAdditionalCharsAfterNewline;
        bufOp.lines = 0;
        assem.append(bufOp);
        bufOpAdditionalCharsAfterNewline = 0;
      }
    }
    bufOp.opcode = '';
  };

  const append = (op) => {
    if (op.chars <= 0) return;
    if (bufOp.opcode === op.opcode && bufOp.attribs === op.attribs) {
      if (op.lines > 0) {
        // bufOp and additional chars are all mergeable into a multi-line op
        bufOp.chars += bufOpAdditionalCharsAfterNewline + op.chars;
        bufOp.lines += op.lines;
        bufOpAdditionalCharsAfterNewline = 0;
      } else if (bufOp.lines === 0) {
        // both bufOp and op are in-line
        bufOp.chars += op.chars;
      } else {
        // append in-line text to multi-line bufOp
        bufOpAdditionalCharsAfterNewline += op.chars;
      }
    } else {
      flush();
      copyOp(op, bufOp);
    }
  };

  const endDocument = () => {
    flush(true);
  };

  const toString = () => {
    flush();
    return assem.toString();
  };

  const clear = () => {
    assem.clear();
    clearOp(bufOp);
  };
  return {
    append,
    toString,
    clear,
    endDocument,
  };
};

/**
 * @returns {OpAssembler}
 */
exports.opAssembler = () => {
  let serialized = '';

  /**
   * @param {Op} op - Operation to add. Ownership remains with the caller.
   */
  const append = (op) => {
    assert(op instanceof Op, 'argument must be an instance of Op');
    serialized += op.toString();
  };

  const toString = () => serialized;

  const clear = () => {
    serialized = '';
  };
  return {
    append,
    toString,
    clear,
  };
};

/**
 * A custom made String Iterator
 *
 * @typedef {object} StringIterator
 * @property {Function} newlines -
 * @property {Function} peek -
 * @property {Function} remaining -
 * @property {Function} skip -
 * @property {Function} take -
 */

/**
 * @param {string} str - String to iterate over
 * @returns {StringIterator}
 */
exports.stringIterator = (str) => {
  let curIndex = 0;
  // newLines is the number of \n between curIndex and str.length
  let newLines = str.split('\n').length - 1;
  const getnewLines = () => newLines;

  const assertRemaining = (n) => {
    assert(n <= remaining(), `!(${n} <= ${remaining()})`);
  };

  const take = (n) => {
    assertRemaining(n);
    const s = str.substr(curIndex, n);
    newLines -= s.split('\n').length - 1;
    curIndex += n;
    return s;
  };

  const peek = (n) => {
    assertRemaining(n);
    const s = str.substr(curIndex, n);
    return s;
  };

  const skip = (n) => {
    assertRemaining(n);
    curIndex += n;
  };

  const remaining = () => str.length - curIndex;
  return {
    take,
    skip,
    remaining,
    peek,
    newlines: getnewLines,
  };
};

/**
 * A custom made StringBuffer
 *
 * @typedef {object} StringAssembler
 * @property {Function} append -
 * @property {Function} toString -
 */

/**
 * @returns {StringAssembler}
 */
exports.stringAssembler = () => ({
  _str: '',
  clear() { this._str = ''; },
  /**
   * @param {string} x -
   */
  append(x) { this._str += String(x); },
  toString() { return this._str; },
});

/**
 * Apply operations to other operations.
 *
 * @param {string} in1 - first Op string
 * @param {string} in2 - second Op string
 * @param {Function} func - Callback that applies an operation to another operation. Will be called
 *     multiple times depending on the number of operations in `in1` and `in2`. `func` has signature
 * @returns {string} the integrated changeset
 */
const applyZip = (in1, in2, func) => {
  const ops1 = exports.deserializeOps(in1);
  const ops2 = exports.deserializeOps(in2);
  let next1 = ops1.next();
  let next2 = ops2.next();
  const assem = exports.smartOpAssembler();
  while (!next1.done || !next2.done) {
    if (!next1.done && !next1.value.opcode) next1 = ops1.next();
    if (!next2.done && !next2.value.opcode) next2 = ops2.next();
    if (next1.value == null) next1.value = new Op();
    if (next2.value == null) next2.value = new Op();
    if (!next1.value.opcode && !next2.value.opcode) break;
    const opOut = func(next1.value, next2.value);
    if (opOut && opOut.opcode) assem.append(opOut);
  }
  assem.endDocument();
  return assem.toString();
};

/**
 * Parses an encoded changeset.
 *
 * @param {string} cs - The encoded changeset.
 * @returns {Changeset}
 */
exports.unpack = (cs) => {
  const headerRegex = /Z:([0-9a-z]+)([><])([0-9a-z]+)|/;
  const headerMatch = headerRegex.exec(cs);
  if ((!headerMatch) || (!headerMatch[0])) error(`Not a changeset: ${cs}`);
  const oldLen = exports.parseNum(headerMatch[1]);
  const changeSign = (headerMatch[2] === '>') ? 1 : -1;
  const changeMag = exports.parseNum(headerMatch[3]);
  const newLen = oldLen + changeSign * changeMag;
  const opsStart = headerMatch[0].length;
  let opsEnd = cs.indexOf('$');
  if (opsEnd < 0) opsEnd = cs.length;
  return {
    oldLen,
    newLen,
    ops: cs.substring(opsStart, opsEnd),
    charBank: cs.substring(opsEnd + 1),
  };
};

/**
 * Applies a Changeset to a string.
 *
 * @param {string} cs - String encoded Changeset
 * @param {string} str - String to which a Changeset should be applied
 * @returns {string}
 */
exports.applyToText = (cs, str) => {
  const unpacked = exports.unpack(cs);
  assert(str.length === unpacked.oldLen, `mismatched apply: ${str.length} / ${unpacked.oldLen}`);
  const bankIter = exports.stringIterator(unpacked.charBank);
  const strIter = exports.stringIterator(str);
  const assem = exports.stringAssembler();
  for (const op of exports.deserializeOps(unpacked.ops)) {
    switch (op.opcode) {
      case '+':
      // op is + and op.lines 0: no newlines must be in op.chars
      // op is + and op.lines >0: op.chars must include op.lines newlines
        if (op.lines !== bankIter.peek(op.chars).split('\n').length - 1) {
          throw new Error(`newline count is wrong in op +; cs:${cs} and text:${str}`);
        }
        assem.append(bankIter.take(op.chars));
        break;
      case '-':
      // op is - and op.lines 0: no newlines must be in the deleted string
      // op is - and op.lines >0: op.lines newlines must be in the deleted string
        if (op.lines !== strIter.peek(op.chars).split('\n').length - 1) {
          throw new Error(`newline count is wrong in op -; cs:${cs} and text:${str}`);
        }
        strIter.skip(op.chars);
        break;
      case '=':
      // op is = and op.lines 0: no newlines must be in the copied string
      // op is = and op.lines >0: op.lines newlines must be in the copied string
        if (op.lines !== strIter.peek(op.chars).split('\n').length - 1) {
          throw new Error(`newline count is wrong in op =; cs:${cs} and text:${str}`);
        }
        assem.append(strIter.take(op.chars));
        break;
    }
  }
  assem.append(strIter.take(strIter.remaining()));
  return assem.toString();
};

/**
 * Composes two attribute strings (see below) into one.
 *
 * @param {AttributeString} att1 - first attribute string
 * @param {AttributeString} att2 - second attribue string
 * @param {boolean} resultIsMutation -
 * @param {AttributePool} pool - attribute pool
 * @returns {string}
 */
exports.composeAttributes = (att1, att2, resultIsMutation, pool) => {
  if ((!att1) && resultIsMutation) {
    return att2;
  }
  if (!att2) return att1;
  return AttributeMap.fromString(att1, pool).updateFromString(att2, !resultIsMutation).toString();
};

/**
 * Function used as parameter for applyZip to apply a Changeset to an attribute.
 *
 * @param {Op} attOp - The op from the sequence that is being operated on, either an attribution
 *     string or the earlier of two exportss being composed.
 * @param {Op} csOp -
 * @param {AttributePool} pool - Can be null if definitely not needed.
 * @returns {Op} The result of applying `csOp` to `attOp`.
 */
const slicerZipperFunc = (attOp, csOp, pool) => {
  const opOut = new Op();
  if (!attOp.opcode) {
    copyOp(csOp, opOut);
    csOp.opcode = '';
  } else if (!csOp.opcode) {
    copyOp(attOp, opOut);
    attOp.opcode = '';
  } else if (attOp.opcode === '-') {
    copyOp(attOp, opOut);
    attOp.opcode = '';
  } else if (csOp.opcode === '+') {
    copyOp(csOp, opOut);
    csOp.opcode = '';
  } else {
    for (const op of [attOp, csOp]) {
      assert(op.chars >= op.lines, `op has more newlines than chars: ${op.toString()}`);
    }
    assert(
        attOp.chars < csOp.chars ? attOp.lines <= csOp.lines
        : attOp.chars > csOp.chars ? attOp.lines >= csOp.lines
        : attOp.lines === csOp.lines,
        'line count mismatch when composing changesets A*B; ' +
        `opA: ${attOp.toString()} opB: ${csOp.toString()}`);
    assert(['+', '='].includes(attOp.opcode), `unexpected opcode in op: ${attOp.toString()}`);
    assert(['-', '='].includes(csOp.opcode), `unexpected opcode in op: ${csOp.toString()}`);
    opOut.opcode = {
      '+': {
        '-': '', // The '-' cancels out (some of) the '+', leaving any remainder for the next call.
        '=': '+',
      },
      '=': {
        '-': '-',
        '=': '=',
      },
    }[attOp.opcode][csOp.opcode];
    const [fullyConsumedOp, partiallyConsumedOp] = [attOp, csOp].sort((a, b) => a.chars - b.chars);
    opOut.chars = fullyConsumedOp.chars;
    opOut.lines = fullyConsumedOp.lines;
    opOut.attribs = csOp.opcode === '-'
      // csOp is a remove op and remove ops normally never have any attributes, so this should
      // normally be the empty string. However, padDiff.js adds attributes to remove ops and needs
      // them preserved so they are copied here.
      ? csOp.attribs
      : exports.composeAttributes(attOp.attribs, csOp.attribs, attOp.opcode === '=', pool);
    partiallyConsumedOp.chars -= fullyConsumedOp.chars;
    partiallyConsumedOp.lines -= fullyConsumedOp.lines;
    if (!partiallyConsumedOp.chars) partiallyConsumedOp.opcode = '';
    fullyConsumedOp.opcode = '';
  }
  return opOut;
};

/**
 * Applies a Changeset to the attribs string of a AText.
 *
 * @param {string} cs - Changeset
 * @param {string} astr - the attribs string of a AText
 * @param {AttributePool} pool - the attibutes pool
 * @returns {string}
 */
exports.applyToAttribution = (cs, astr, pool) => {
  const unpacked = exports.unpack(cs);
  return applyZip(astr, unpacked.ops, (op1, op2) => slicerZipperFunc(op1, op2, pool));
};

exports.splitAttributionLines = (attrOps, text) => {
  const assem = exports.mergingOpAssembler();
  const lines = [];
  let pos = 0;

  const appendOp = (op) => {
    assem.append(op);
    if (op.lines > 0) {
      lines.push(assem.toString());
      assem.clear();
    }
    pos += op.chars;
  };

  for (const op of exports.deserializeOps(attrOps)) {
    let numChars = op.chars;
    let numLines = op.lines;
    while (numLines > 1) {
      const newlineEnd = text.indexOf('\n', pos) + 1;
      assert(newlineEnd > 0, 'newlineEnd <= 0 in splitAttributionLines');
      op.chars = newlineEnd - pos;
      op.lines = 1;
      appendOp(op);
      numChars -= op.chars;
      numLines -= op.lines;
    }
    if (numLines === 1) {
      op.chars = numChars;
      op.lines = 1;
    }
    appendOp(op);
  }

  return lines;
};

/**
 * Create an attribution inserting a text.
 *
 * @param {string} text - text to insert
 * @returns {string}
 */
exports.makeAttribution = (text) => {
  const assem = exports.smartOpAssembler();
  for (const op of opsFromText('+', text)) assem.append(op);
  return assem.toString();
};

/**
 * Create a Changeset going from Identity to a certain state.
 *
 * @param {string} text - text of the final change
 * @param {string} attribs - optional, operations which insert the text and also puts the right
 *     attributes
 * @returns {AText}
 */
exports.makeAText = (text, attribs) => ({
  text,
  attribs: (attribs || exports.makeAttribution(text)),
});

/**
 * Apply a Changeset to a AText.
 *
 * @param {string} cs - Changeset to apply
 * @param {AText} atext -
 * @param {AttributePool} pool - Attribute Pool to add to
 * @returns {AText}
 */
exports.applyToAText = (cs, atext, pool) => ({
  text: exports.applyToText(cs, atext.text),
  attribs: exports.applyToAttribution(cs, atext.attribs, pool),
});

/**
 * Like "substring" but on a single-line attribution string.
 */
exports.subattribution = (astr, start, optEnd) => {
  const attOps = exports.deserializeOps(astr);
  let attOpsNext = attOps.next();
  const assem = exports.smartOpAssembler();
  let attOp = new Op();
  const csOp = new Op();

  const doCsOp = () => {
    if (!csOp.chars) return;
    while (csOp.opcode && (attOp.opcode || !attOpsNext.done)) {
      if (!attOp.opcode) {
        attOp = attOpsNext.value;
        attOpsNext = attOps.next();
      }
      if (csOp.opcode && attOp.opcode && csOp.chars >= attOp.chars &&
          attOp.lines > 0 && csOp.lines <= 0) {
        csOp.lines++;
      }
      const opOut = slicerZipperFunc(attOp, csOp, null);
      if (opOut.opcode) assem.append(opOut);
    }
  };

  csOp.opcode = '-';
  csOp.chars = start;

  doCsOp();

  if (optEnd === undefined) {
    if (attOp.opcode) {
      assem.append(attOp);
    }
    while (!attOpsNext.done) {
      assem.append(attOpsNext.value);
      attOpsNext = attOps.next();
    }
  } else {
    csOp.opcode = '=';
    csOp.chars = optEnd - start;
    doCsOp();
  }

  return assem.toString();
};
