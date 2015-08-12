/**
 * BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
 *
 * Copyright (c) 2012 BigBlueButton Inc. and by respective authors (see below).
 *
 * This program is free software; you can redistribute it and/or modify it under the
 * terms of the GNU Lesser General Public License as published by the Free Software
 * Foundation; either version 3.0 of the License, or (at your option) any later
 * version.
 *
 * BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
 * PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License along
 * with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
 *
 */
package org.bigbluebutton.modules.sharednotes.views.components {

	import flash.events.Event;
	import flash.net.FileReference;
	import flash.text.*;

	import mx.core.mx_internal;
	import mx.controls.RichTextEditor;

	import org.bigbluebutton.modules.sharednotes.util.DiffPatch;

	public class CustomRichTextEditor extends RichTextEditor {
		private var _lastBegin:int = 0;
		private var _lastEnd:int = 0;

		public function CustomRichTextEditor() {}

		public function saveNotesToFile(title:String):void {
			var filename:String = title.replace(/\s+/g, '-').toLowerCase();
			var _fileRef:FileReference = new FileReference();
			_fileRef.addEventListener(Event.COMPLETE, function(e:Event):void {
				dispatchEvent(new Event("SHARED_NOTES_SAVED"));
			});

			var cr:String = String.fromCharCode(13);
			var lf:String = String.fromCharCode(10);
			var crlf:String = String.fromCharCode(13, 10);

			var textToExport:String = htmlText;
			textToExport = textToExport.replace(new RegExp(crlf, "g"), '\n');
			textToExport = textToExport.replace(new RegExp(cr, "g"), '\n');
			textToExport = textToExport.replace(new RegExp(lf, "g"), '\n');
			textToExport = textToExport.replace(new RegExp('\n', "g"), crlf);

			_fileRef.save(textToExport, filename+".html");
		}

		public function restoreCursor(endIndex:Number, oldPosition:Number):void {
			var cursorLine:Number = 0;

			if (endIndex == 0 && text.length == 0) {
				cursorLine = 0;
			} else if (endIndex == text.length) {
				cursorLine = textArea.mx_internal::getTextField().getLineIndexOfChar(endIndex - 1);
			} else {
				cursorLine = textArea.mx_internal::getTextField().getLineIndexOfChar(endIndex);
			}

			var relativePositon:Number = cursorLine - textArea.verticalScrollPosition;

			var desloc:Number = relativePositon - oldPosition;
			textArea.verticalScrollPosition += desloc;

			trace("relative: " + relativePositon);
			trace("old: " + oldPosition);
			trace("vertical: " + textArea.verticalScrollPosition);
		}

		public function getOldPosition():Number {
			var oldPosition:Number = 0;

			if (textArea.selectionEndIndex == 0 && text.length == 0) {
				oldPosition = 0;
			} else if (textArea.selectionEndIndex == text.length) {
				oldPosition = textArea.mx_internal::getTextField().getLineIndexOfChar(textArea.selectionEndIndex - 1);
			} else {
				oldPosition = textArea.mx_internal::getTextField().getLineIndexOfChar(textArea.selectionEndIndex);
			}

			oldPosition -= textArea.verticalScrollPosition;
			return oldPosition;
		}

		public function patch(patch:String):void {
			var results:Array;

			// We Shouldn't?
//			textArea.selectable = false;

			_lastBegin = textArea.selectionBeginIndex;
			_lastEnd = textArea.selectionEndIndex;
			var oldPosition:Number = getOldPosition();

			trace("Initial Position: " + _lastBegin + " " + _lastEnd);

			var oldText:String = text;
			htmlText = DiffPatch.patch(patch, htmlText);
			validateNow();

			var plainPatch:String = DiffPatch.diff(oldText, text);
			results = DiffPatch.patchClientText(plainPatch, oldText, _lastBegin, _lastEnd);

			if (results[0][0] == _lastBegin && results[0][1] > _lastEnd) {
				var str1:String = oldText.substring(_lastBegin, _lastEnd);
				var str2:String = results[1].substring(_lastBegin, _lastEnd);

				if (str1 != str2) {
					_lastEnd = results[0][1];
				}

			} else {
				_lastBegin = results[0][0];
				_lastEnd = results[0][1];
			}
			trace("Final Position: " + results[0][0] + " " + results[0][1]);

			trace("Length: " + text.length);
			restoreCursor(_lastEnd, oldPosition);
			validateNow();

			textArea.selectable = true;
			textArea.setSelection(_lastBegin, _lastEnd);
			validateNow();
		}
	}
}
