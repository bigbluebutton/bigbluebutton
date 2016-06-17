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
package org.bigbluebutton.modules.sharednotes.views.components {
	import com.asfusion.mate.events.Dispatcher;

	import mx.controls.TextArea;
	
	import flash.events.Event;
	
	import org.bigbluebutton.modules.sharednotes.util.DiffPatch;
	import flash.net.FileReference;
	import org.bigbluebutton.util.i18n.ResourceUtil;
	import flash.geom.*;
	import flash.text.*;
	import flash.events.MouseEvent;
	import flash.events.FocusEvent;
	import flash.events.KeyboardEvent
	import flash.display.InteractiveObject;


	public class PatchableTextArea extends TextArea {
		private var _patch : String = "";
		private var _patchChanged : Boolean = false;
		private var lastBegin:int = 0;
		private var lastEnd:int = 0;
		
		public function PatchableTextArea() {
		}

		public function init():void {
			this.textField.alwaysShowSelection = true;
		}

		public function set patch(value:String):void {
			_patch = value;
			_patchChanged = true;
			invalidateProperties();
		}
		
		override protected function commitProperties():void
		{			
			super.commitProperties();
		}

		public function get textFieldText():String {
			return textField.text;
		}

		public function getOldPosition():Number {
			var oldPosition:Number = 0;
			if(selectionEndIndex == 0 && this.text.length == 0) {
				oldPosition = 0;
			}
			else if(selectionEndIndex == this.text.length) {
				oldPosition = this.textField.getLineIndexOfChar(selectionEndIndex-1);
			}
			else
				oldPosition = this.textField.getLineIndexOfChar(selectionEndIndex);	

			oldPosition-=this.verticalScrollPosition;
			return oldPosition;
		}

		public function restoreCursor(endIndex:Number, oldPosition:Number, oldVerticalPosition:Number):void {
			var cursorLine:Number = 0;
			if(endIndex == 0 && this.text.length == 0) {
				cursorLine = 0;
			}
			else if(endIndex == this.text.length) {
				cursorLine = this.textField.getLineIndexOfChar(endIndex-1);
			}
			else
				cursorLine = this.textField.getLineIndexOfChar(endIndex);

			var relativePositon:Number = cursorLine - this.verticalScrollPosition;

			var desloc:Number = relativePositon - oldPosition;
			this.verticalScrollPosition+=desloc;
			
			LOGGER.debug("relative: " +  relativePositon);
			LOGGER.debug("old: " + oldPosition);
			LOGGER.debug("vertical: " + this.verticalScrollPosition);
		}

		
		public function patchClientText(patch:String, beginIndex:Number, endIndex:Number):void {
			var results:Array;

			lastBegin = selectionBeginIndex;
			lastEnd = selectionEndIndex;
			var oldPosition:Number = getOldPosition();
			var oldVerticalPosition:Number = this.verticalScrollPosition;

			LOGGER.debug("Initial Position: " + lastBegin + " " + lastEnd);
			results = DiffPatch.patchClientText(patch, textField.text, selectionBeginIndex, selectionEndIndex);

			if(results[0][0] == lastBegin && results[0][1] > lastEnd) {
				var str1:String = this.text.substring(lastBegin,lastEnd);
				var str2:String = results[1].substring(lastBegin,lastEnd);
				LOGGER.debug("STRING 1: " + str1);
				LOGGER.debug("STRING 2: " + str2);
				
				if(str1 != str2) {
					lastEnd = results[0][1];
				}

			} else {
				lastBegin = results[0][0];
				lastEnd = results[0][1];
			}
			this.text = results[1];
			this.validateNow();
			
			LOGGER.debug("Final Position: " + results[0][0] + " " + results[0][1]);
			
			LOGGER.debug("Length: " + this.text.length); 
			restoreCursor(lastEnd, oldPosition, oldVerticalPosition);
			this.validateNow();
			textField.selectable = true;
			// textField.stage.focus = InteractiveObject(textField);
			textField.setSelection(lastBegin, lastEnd);	
			this.validateNow();
		}
	}
}
