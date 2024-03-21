'use strict';
/**
 * Copyright 2009 Google Inc.
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

const Changeset = require('./Changeset');
const attributes = require('./attributes');
const AttributeMap = require('./AttributeMap');

const nativeSome = Array.prototype.some

const has = function(obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key);
};

const each = function(obj, iterator, context) {
  if (obj == null) return;
  if (nativeForEach && obj.forEach === nativeForEach) {
    obj.forEach(iterator, context);
  } else if (obj.length === +obj.length) {
    for (var i = 0, l = obj.length; i < l; i++) {
      if (iterator.call(context, obj[i], i, obj) === breaker) return;
    }
  } else {
    for (var key in obj) {
      if (has(obj, key)) {
        if (iterator.call(context, obj[key], key, obj) === breaker) return;
      }
    }
  }
};

const any = function(obj, iterator, context) {
  iterator || (iterator = _.identity);
  var result = false;
  if (obj == null) return result;
  if (nativeSome && obj.some === nativeSome) return obj.some(iterator, context);
  each(obj, function(value, index, list) {
    if (result || (result = iterator.call(context, value, index, list))) return breaker;
  });
  return !!result;
};

const find = function(obj, iterator, context) {
  var result;
  any(obj, function(value, index, list) {
    if (iterator.call(context, value, index, list)) {
      result = value;
      return true;
    }
  });
  return result;
};

function escapeHTML(s) {
  var n = s;
  n = n.replace(/&/g, '&amp;');
  n = n.replace(/</g, '&lt;');
  n = n.replace(/>/g, '&gt;');
  n = n.replace(/"/g, '&quot;');

  return n;
}

const _encodeWhitespace =
  (s) => s.replace(/[^\x21-\x7E\s\t\n\r]/gu, (c) => `&#${c.codePointAt(0)};`);

const _analyzeLine = (text, aline, apool) => {
  const line = {};

  // identify list
  let lineMarker = 0;
  line.listLevel = 0;
  if (aline) {
    const [op] = Changeset.deserializeOps(aline);
    if (op != null) {
      const attribs = AttributeMap.fromString(op.attribs, apool);
      let listType = attribs.get('list');
      if (listType) {
        lineMarker = 1;
        listType = /([a-z]+)([0-9]+)/.exec(listType);
        if (listType) {
          line.listTypeName = listType[1];
          line.listLevel = Number(listType[2]);
        }
      }
      const start = attribs.get('start');
      if (start) {
        line.start = start;
      }
    }
  }
  if (lineMarker) {
    line.text = text.substring(1);
    line.aline = Changeset.subattribution(aline, 1);
  } else {
    line.text = text;
    line.aline = aline;
  }
  return line;
};

const wordCharRegex = new RegExp(`[${[
  '\u0030-\u0039',
  '\u0041-\u005A',
  '\u0061-\u007A',
  '\u00C0-\u00D6',
  '\u00D8-\u00F6',
  '\u00F8-\u00FF',
  '\u0100-\u1FFF',
  '\u3040-\u9FFF',
  '\uF900-\uFDFF',
  '\uFE70-\uFEFE',
  '\uFF10-\uFF19',
  '\uFF21-\uFF3A',
  '\uFF41-\uFF5A',
  '\uFF66-\uFFDC',
].join('')}]`);

const urlRegex = (() => {
  // TODO: wordCharRegex matches many characters that are not permitted in URIs. Are they included
  // here as an attempt to support IRIs? (See https://tools.ietf.org/html/rfc3987.)
  const urlChar = `[-:@_.,~%+/?=&#!;()\\[\\]$'*${wordCharRegex.source.slice(1, -1)}]`;
  // Matches a single character that should not be considered part of the URL if it is the last
  // character that matches urlChar.
  const postUrlPunct = '[:.,;?!)\\]\'*]';
  // Schemes that must be followed by ://
  const withAuth = `(?:${[
    '(?:x-)?man',
    'afp',
    'file',
    'ftps?',
    'gopher',
    'https?',
    'nfs',
    'sftp',
    'smb',
    'txmt',
  ].join('|')})://`;
  // Schemes that do not need to be followed by ://
  const withoutAuth = `(?:${[
    'about',
    'geo',
    'mailto',
    'tel',
  ].join('|')}):`;
  return new RegExp(
      `(?:${withAuth}|${withoutAuth}|www\\.)${urlChar}*(?!${postUrlPunct})${urlChar}`, 'g');
})();

const regexUtils = {
  urlRegex
}

const findURLs = (text) => {
  // Copy padutils.urlRegex so that the use of .exec() below (which mutates the RegExp object)
  // does not break other concurrent uses of padutils.urlRegex.
  const urlRegex = new RegExp(regexUtils.urlRegex, 'g');
  urlRegex.lastIndex = 0;
  let urls = null;
  let execResult;
  // TODO: Switch to String.prototype.matchAll() after support for Node.js < 12.0.0 is dropped.
  while ((execResult = urlRegex.exec(text))) {
    urls = (urls || []);
    const startIndex = execResult.index;
    const url = execResult[0];
    urls.push([startIndex, url]);
  }
  return urls;
}

const getHTMLFromAtext = (attrPool, atext, authorColors) => {
  const apool = attrPool;
  const textLines = atext.text.slice(0, -1).split('\n');
  const attribLines = Changeset.splitAttributionLines(atext.attribs, atext.text);

  const tags = ['h1', 'h2', 'strong', 'em', 'u', 's'];
  const props = ['heading1', 'heading2', 'bold', 'italic', 'underline', 'strikethrough'];

  const anumMap = {};
  let css = '';

  // iterates over all props(h1,h2,strong,...), checks if it is used in
  // this pad, and if yes puts its attrib id->props value into anumMap
  props.forEach((propName, i) => {
    let attrib = [propName, true];
    if (Array.isArray(propName)) {
      // propName can be in the form of ['color', 'red'],
      // see hook exportHtmlAdditionalTagsWithData
      attrib = propName;
    }
    const propTrueNum = apool.putAttrib(attrib, true);
    if (propTrueNum >= 0) {
      anumMap[propTrueNum] = i;
    }
  });

  const getLineHTML = (text, attribs) => {
    const taker = Changeset.stringIterator(text);
    const assem = Changeset.stringAssembler();
    const openTags = [];

    // tags added by exportHtmlAdditionalTagsWithData will be exported as <span> with
    // data attributes
    const isSpanWithData = (i) => {
      const property = props[i];
      return Array.isArray(property);
    };

    const emitOpenTag = (i) => {
      openTags.unshift(i);
      
      assem.append('<');
      assem.append(tags[i]);
      assem.append('>');
    };

    // this closes an open tag and removes its reference from openTags
    const emitCloseTag = (i) => {
      openTags.shift();
      const spanWithData = isSpanWithData(i);

      if (spanWithData) {
        assem.append('</span>');
      } else {
        assem.append('</');
        assem.append(tags[i]);
        assem.append('>');
      }
    };

    const urls = findURLs(text);

    let idx = 0;

    const processNextChars = (numChars) => {
      if (numChars <= 0) {
        return;
      }

      const ops = Changeset.deserializeOps(Changeset.subattribution(attribs, idx, idx + numChars));
      idx += numChars;

      // this iterates over every op string and decides which tags to open or to close
      // based on the attribs used
      for (const o of ops) {
        const usedAttribs = [];

        // mark all attribs as used
        for (const a of attributes.decodeAttribString(o.attribs)) {
          if (a in anumMap) {
            usedAttribs.push(anumMap[a]); // i = 0 => bold, etc.
          }
        }
        let outermostTag = -1;
        // find the outer most open tag that is no longer used
        for (let i = openTags.length - 1; i >= 0; i--) {
          if (usedAttribs.indexOf(openTags[i]) === -1) {
            outermostTag = i;
            break;
          }
        }

        // close all tags upto the outer most
        if (outermostTag !== -1) {
          while (outermostTag >= 0) {
            emitCloseTag(openTags[0]);
            outermostTag--;
          }
        }

        // open all tags that are used but not open
        for (let i = 0; i < usedAttribs.length; i++) {
          if (openTags.indexOf(usedAttribs[i]) === -1) {
            emitOpenTag(usedAttribs[i]);
          }
        }

        let chars = o.chars;
        if (o.lines) {
          chars--; // exclude newline at end of line, if present
        }

        let s = taker.take(chars);

        // removes the characters with the code 12. Don't know where they come
        // from but they break the abiword parser and are completly useless
        s = s.replace(String.fromCharCode(12), '');

        assem.append(_encodeWhitespace(escapeHTML(s)));
      } // end iteration over spans in line

      // close all the tags that are open after the last op
      while (openTags.length > 0) {
        emitCloseTag(openTags[0]);
      }
    };
    // end processNextChars
    if (urls) {
      urls.forEach((urlData) => {
        const startIndex = urlData[0];
        const url = urlData[1];
        const urlLength = url.length;
        processNextChars(startIndex - idx);

        assem.append(`<a href="${escapeHTML(url)}" rel="noreferrer noopener">`);
        processNextChars(urlLength);
        assem.append('</a>');
      });
    }
    processNextChars(text.length - idx);

    return _processSpaces(assem.toString());
  };
  // end getLineHTML
  const pieces = [css];

  let openLists = [];
  for (let i = 0; i < textLines.length; i++) {
    let context;
    const line = _analyzeLine(textLines[i], attribLines[i], apool);
    const lineContent = getLineHTML(line.text, line.aline);
    // If we are inside a list
    if (line.listLevel) {
      context = {
        line,
        lineContent,
        apool,
        attribLine: attribLines[i],
        text: textLines[i],
      };
      let prevLine = null;
      let nextLine = null;
      if (i > 0) {
        prevLine = _analyzeLine(textLines[i - 1], attribLines[i - 1], apool);
      }
      if (i < textLines.length) {
        nextLine = _analyzeLine(textLines[i + 1], attribLines[i + 1], apool);
      }
      // await hooks.aCallAll('getLineHTMLForExport', context);
      // To create list parent elements
      if ((!prevLine || prevLine.listLevel !== line.listLevel) ||
          (line.listTypeName !== prevLine.listTypeName)) {
        const exists = find(openLists, (item) => (
          item.level === line.listLevel && item.type === line.listTypeName));
        if (!exists) {
          let prevLevel = 0;
          if (prevLine && prevLine.listLevel) {
            prevLevel = prevLine.listLevel;
          }
          if (prevLine && line.listTypeName !== prevLine.listTypeName) {
            prevLevel = 0;
          }

          for (let diff = prevLevel; diff < line.listLevel; diff++) {
            openLists.push({level: diff, type: line.listTypeName});
            const prevPiece = pieces[pieces.length - 1];

            if (prevPiece.indexOf('<ul') === 0 ||
                prevPiece.indexOf('<ol') === 0 ||
                prevPiece.indexOf('</li>') === 0) {
              if ((nextLine.listTypeName === 'number') && (nextLine.text === '')) {
                // is the listTypeName check needed here?  null text might be completely fine!
                // TODO Check against Uls
                // don't do anything because the next item is a nested ol openener so
                // we need to keep the li open
              } else {
                pieces.push('<li>');
              }
            }

            if (line.listTypeName === 'number') {
              if (line.start) {
                pieces.push(`<ol start="${Number(line.start)}" class="${line.listTypeName}">`);
              } else {
                pieces.push(`<ol class="${line.listTypeName}">`);
              }
            } else {
              pieces.push(`<ul class="${line.listTypeName}">`);
            }
          }
        }
      }
      // if we're going up a level we shouldn't be adding..
      if (context.lineContent) {
        pieces.push('<li>', context.lineContent);
      }

      // To close list elements
      if (nextLine &&
          nextLine.listLevel === line.listLevel &&
          line.listTypeName === nextLine.listTypeName) {
        if (context.lineContent) {
          if ((nextLine.listTypeName === 'number') && (nextLine.text === '')) {
            // is the listTypeName check needed here?  null text might be completely fine!
          } else {
            pieces.push('</li>');
          }
        }
      }
      if ((!nextLine ||
           !nextLine.listLevel ||
           nextLine.listLevel < line.listLevel) ||
          (line.listTypeName !== nextLine.listTypeName)) {
        let nextLevel = 0;
        if (nextLine && nextLine.listLevel) {
          nextLevel = nextLine.listLevel;
        }
        if (nextLine && line.listTypeName !== nextLine.listTypeName) {
          nextLevel = 0;
        }

        for (let diff = nextLevel; diff < line.listLevel; diff++) {
          openLists = openLists.filter((el) => el.level !== diff && el.type !== line.listTypeName);

          if (pieces[pieces.length - 1].indexOf('</ul') === 0 ||
              pieces[pieces.length - 1].indexOf('</ol') === 0) {
            pieces.push('</li>');
          }

          if (line.listTypeName === 'number') {
            pieces.push('</ol>');
          } else {
            pieces.push('</ul>');
          }
        }
      }
    } else {
      // outside any list, need to close line.listLevel of lists
      context = {
        line,
        lineContent,
        apool,
        attribLine: attribLines[i],
        text: textLines[i],
      };

      // await hooks.aCallAll('getLineHTMLForExport', context);
      pieces.push(context.lineContent, '<br>');
    }
  }

  return pieces.join('');
};

// copied from ACE
const _processSpaces = (s) => {
  const doesWrap = true;
  if (s.indexOf('<') < 0 && !doesWrap) {
    // short-cut
    return s.replace(/ /g, '&nbsp;');
  }
  const parts = [];
  s.replace(/<[^>]*>?| |[^ <]+/g, (m) => {
    parts.push(m);
  });
  if (doesWrap) {
    let endOfLine = true;
    let beforeSpace = false;
    // last space in a run is normal, others are nbsp,
    // end of line is nbsp
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      if (p === ' ') {
        if (endOfLine || beforeSpace) parts[i] = '&nbsp;';
        endOfLine = false;
        beforeSpace = true;
      } else if (p.charAt(0) !== '<') {
        endOfLine = false;
        beforeSpace = false;
      }
    }
    // beginning of line is nbsp
    for (let i = 0; i < parts.length; i++) {
      const p = parts[i];
      if (p === ' ') {
        parts[i] = '&nbsp;';
        break;
      } else if (p.charAt(0) !== '<') {
        break;
      }
    }
  } else {
    for (let i = 0; i < parts.length; i++) {
      const p = parts[i];
      if (p === ' ') {
        parts[i] = '&nbsp;';
      }
    }
  }
  return parts.join('');
};

// exports.getPadHTML = getPadHTML;
exports.getHTMLFromAtext = getHTMLFromAtext;
