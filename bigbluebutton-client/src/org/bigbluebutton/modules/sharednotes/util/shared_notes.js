/*
    This file is part of BBB-Notes.

    Copyright (c) Islam El-Ashi. All rights reserved.

    BBB-Notes is free software: you can redistribute it and/or modify
    it under the terms of the Lesser GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    any later version.

    BBB-Notes is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    Lesser GNU General Public License for more details.

    You should have received a copy of the Lesser GNU General Public License
    along with BBB-Notes.  If not, see <http://www.gnu.org/licenses/>.

    Author: Islam El-Ashi <ielashi@gmail.com>, <http://www.ielashi.com>
*/
var dmp = new diff_match_patch();
var debug = false;

function diff(text1, text2) {
  return dmp.patch_toText(dmp.patch_make(dmp.diff_main(unescape(text1),unescape(text2))));
}

function patch(patch, text) {
  return dmp.patch_apply(dmp.patch_fromText(patch), unescape(text))[0];
}

function unpatch(patch, text) {
  return dmp.patch_apply_reverse(dmp.patch_fromText(patch), unescape(text))[0];
}


/**
 * Helper Methods
 */

/**
 * MobWrite - Real-time Synchronization and Collaboration Service
 *
 * Copyright 2006 Google Inc.
 * http://code.google.com/p/google-mobwrite/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Modify the user's plaintext by applying a series of patches against it.
 * @param {Array.<patch_obj>} patches Array of Patch objects.
 * @param {String} client text
 */
function patchClientText(patches, text, selectionStart, selectionEnd) {
  text = unescape(text)
  // Set some constants which tweak the matching behaviour.
  // Maximum distance to search from expected location.
  dmp.Match_Distance = 1000;
  // At what point is no match declared (0.0 = perfection, 1.0 = very loose)
  dmp.Match_Threshold = 0.6;

  var oldClientText = text
  oldClientText = oldClientText + "``````````````````````";
  var cursor = captureCursor_(oldClientText, selectionStart, selectionEnd);
  // Pack the cursor offsets into an array to be adjusted.
  // See http://neil.fraser.name/writing/cursor/
  var offsets = [];
  if (cursor) {
    offsets[0] = cursor.startOffset;
    if ('endOffset' in cursor) {
      offsets[1] = cursor.endOffset;
    }
  }
  var newClientText = patch_apply_(patches, oldClientText, offsets);
  // Set the new text only if there is a change to be made.
  if (oldClientText != newClientText) {
    //this.setClientText(newClientText);
    if (cursor) {
      // Unpack the offset array.
      cursor.startOffset = offsets[0];
      if (offsets.length > 1) {
        cursor.endOffset = offsets[1];
        if (cursor.startOffset >= cursor.endOffset) {
          cursor.collapsed = true;
        }
      }
      return [restoreCursor_(cursor, newClientText), newClientText.substring(0,newClientText.length-22)];
    }
  }
  // no change in client text

  return [[selectionStart, selectionEnd], newClientText.substring(0,newClientText.length-22)];
}

/**
 * Merge a set of patches onto the text.  Return a patched text.
 * @param {Array.<patch_obj>} patches Array of patch objects.
 * @param {string} text Old text.
 * @param {Array.<number>} offsets Offset indices to adjust.
 * @return {string} New text.
 */
function patch_apply_(patchText, text, offsets) {
  var patches = dmp.patch_fromText(patchText);
  if (patches.length == 0) {
    return text;
  }

  // Deep copy the patches so that no changes are made to originals.
  patches = dmp.patch_deepCopy(patches);
  var nullPadding = dmp.patch_addPadding(patches);
  text = nullPadding + text + nullPadding;

  dmp.patch_splitMax(patches);
  // delta keeps track of the offset between the expected and actual location
  // of the previous patch.  If there are patches expected at positions 10 and
  // 20, but the first patch was found at 12, delta is 2 and the second patch
  // has an effective expected position of 22.
  var delta = 0;
  for (var x = 0; x < patches.length; x++) {
    var expected_loc = patches[x].start2 + delta;
    var text1 = dmp.diff_text1(patches[x].diffs);
    var start_loc;
    var end_loc = -1;
    if (text1.length > dmp.Match_MaxBits) {
      // patch_splitMax will only provide an oversized pattern in the case of
      // a monster delete.
      start_loc = dmp.match_main(text, text1.substring(0, dmp.Match_MaxBits), expected_loc);
      if (start_loc != -1) {
        end_loc = dmp.match_main(text, text1.substring(text1.length - dmp.Match_MaxBits),
          expected_loc + text1.length - dmp.Match_MaxBits);
        if (end_loc == -1 || start_loc >= end_loc) {
          // Can't find valid trailing context.  Drop this patch.
          start_loc = -1;
        }
      }
    } else {
      start_loc = dmp.match_main(text, text1, expected_loc);
    }
    if (start_loc == -1) {
      // No match found.  :(
      if (debug) {
        window.console.warn('Patch failed: ' + patches[x]);
      }
      // Subtract the delta for this failed patch from subsequent patches.
      delta -= patches[x].length2 - patches[x].length1;
    } else {
      // Found a match.  :)
      if (debug) {
        window.console.info('Patch OK.');
      }
      delta = start_loc - expected_loc;
      var text2;
      if (end_loc == -1) {
        text2 = text.substring(start_loc, start_loc + text1.length);
      } else {
        text2 = text.substring(start_loc, end_loc + dmp.Match_MaxBits);
      }
      // Run a diff to get a framework of equivalent indices.
      var diffs = dmp.diff_main(text1, text2, false);
      if (text1.length > dmp.Match_MaxBits && dmp.diff_levenshtein(diffs) / text1.length > dmp.Patch_DeleteThreshold) {
        // The end points match, but the content is unacceptably bad.
        if (debug) {
          window.console.warn('Patch contents mismatch: ' + patches[x]);
        }
      } else {
        var index1 = 0;
        var index2;
        for (var y = 0; y < patches[x].diffs.length; y++) {
          var mod = patches[x].diffs[y];
          if (mod[0] !== DIFF_EQUAL) {
            index2 = dmp.diff_xIndex(diffs, index1);
          }
          if (mod[0] === DIFF_INSERT) {  // Insertion
            text = text.substring(0, start_loc + index2) + mod[1] + text.substring(start_loc + index2);
            for (var i = 0; i < offsets.length; i++) {
              if (offsets[i] + nullPadding.length > start_loc + index2) {
                offsets[i] += mod[1].length;
              }
            }
          } else if (mod[0] === DIFF_DELETE) {  // Deletion
            var del_start = start_loc + index2;
            var del_end = start_loc + dmp.diff_xIndex(diffs, index1 + mod[1].length);
            text = text.substring(0, del_start) + text.substring(del_end);
            for (var i = 0; i < offsets.length; i++) {
              if (offsets[i] + nullPadding.length > del_start) {
                if (offsets[i] + nullPadding.length < del_end) {
                  offsets[i] = del_start - nullPadding.length;
                } else {
                  offsets[i] -= del_end - del_start;
                }
              }
            }
          }
          if (mod[0] !== DIFF_DELETE) {
            index1 += mod[1].length;
          }
        }
      }
    }
  }
  // Strip the padding off.
  text = text.substring(nullPadding.length, text.length - nullPadding.length);
  return text;
}

/**
 * Record information regarding the current cursor.
 * @return {Object?} Context information of the cursor.
 * @private
 */
function captureCursor_(text, selectionStart, selectionEnd) {
  var padLength = dmp.Match_MaxBits / 2;  // Normally 16.
  var cursor = {};

  cursor.startPrefix = text.substring(selectionStart - padLength, selectionStart);
  cursor.startSuffix = text.substring(selectionStart, selectionStart + padLength);
  cursor.startOffset = selectionStart;
  cursor.collapsed = (selectionStart == selectionEnd);
  if (!cursor.collapsed) {
    cursor.endPrefix = text.substring(selectionEnd - padLength, selectionEnd);
    cursor.endSuffix = text.substring(selectionEnd, selectionEnd + padLength);
    cursor.endOffset = selectionEnd;
  }

  return cursor;
}

/**
 * Attempt to restore the cursor's location.
 * @param {Object} cursor Context information of the cursor.
 * @private
 */
function restoreCursor_(cursor, text) {
  // Set some constants which tweak the matching behaviour.
  // Maximum distance to search from expected location.
  dmp.Match_Distance = 1000;
  // At what point is no match declared (0.0 = perfection, 1.0 = very loose)
  dmp.Match_Threshold = 0.9;

  var padLength = dmp.Match_MaxBits / 2;  // Normally 16.
  var newText = text;
  // Find the start of the selection in the new text.
  var pattern1 = cursor.startPrefix + cursor.startSuffix;
  var pattern2, diff;
  var cursorStartPoint = dmp.match_main(newText, pattern1, cursor.startOffset - padLength);

  if (cursorStartPoint !== null) {
    pattern2 = newText.substring(cursorStartPoint, cursorStartPoint + pattern1.length);
    // Run a diff to get a framework of equivalent indicies.
    diff = dmp.diff_main(pattern1, pattern2, false);
    cursorStartPoint += dmp.diff_xIndex(diff, cursor.startPrefix.length);
  }

  var cursorEndPoint = null;
  if (!cursor.collapsed) {
    // Find the end of the selection in the new text.
    pattern1 = cursor.endPrefix + cursor.endSuffix;
    cursorEndPoint = dmp.match_main(newText, pattern1, cursor.endOffset - padLength);
    if (cursorEndPoint !== null) {
      pattern2 = newText.substring(cursorEndPoint, cursorEndPoint + pattern1.length);
      // Run a diff to get a framework of equivalent indicies.
      diff = dmp.diff_main(pattern1, pattern2, false);
      cursorEndPoint += dmp.diff_xIndex(diff, cursor.endPrefix.length);
    }
  }

  // Deal with loose ends
  if (cursorStartPoint === null && cursorEndPoint !== null) {
    // Lost the start point of the selection, but we have the end point.
    // Collapse to end point.
    cursorStartPoint = cursorEndPoint;
  } else if (cursorStartPoint === null && cursorEndPoint === null) {
    // Lost both start and end points.
    // Jump to the offset of start.
    cursorStartPoint = cursor.startOffset;
  }
  if (cursorEndPoint === null) {
    // End not known, collapse to start.
    cursorEndPoint = cursorStartPoint;
  }

  return [cursorStartPoint, cursorEndPoint];
}

