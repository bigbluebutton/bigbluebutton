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

package org.bigbluebutton.modules.caption.views {
	import com.asfusion.mate.events.Dispatcher;
	
	import flash.events.Event;
	import flash.events.KeyboardEvent;
	import flash.events.TextEvent;
	import flash.text.TextFieldType;
	import flash.ui.Keyboard;
	
	import mx.binding.utils.BindingUtils;
	import mx.binding.utils.ChangeWatcher;
	import mx.containers.Box;
	import mx.events.FlexEvent;
	
	import org.bigbluebutton.core.managers.UserManager;
	import org.bigbluebutton.modules.caption.events.SendEditCaptionHistoryEvent;
	import org.bigbluebutton.modules.caption.model.Transcript;

	public class TextTab extends Box {
		
		[Bindable]
		private var currentTranscript:Transcript;
		
		private var transcriptChangeWatcher:ChangeWatcher;
		
		private var _checkForOverwrite:Boolean = false;
		private var _checkForDeletePreviousWord:Boolean = false;
		private var _checkForDeleteNextWord:Boolean = false;
		private var _lastTextInput:String;
		private var _lastTextLength:int;
		private var _lastSelectionIndex:int;
		
		private var inputArea:TextArea2;
		private var outputArea:TextArea2;
		
		public function TextTab(startIndex:int) {
			super();
			
			inputArea = new TextArea2();
			inputArea.percentWidth = 100;
			inputArea.percentHeight = 100;
			inputArea.tabIndex = startIndex+1;
			inputArea.addEventListener(TextEvent.TEXT_INPUT, onTranscriptTextInput);
			inputArea.addEventListener(Event.CHANGE, onTranscriptTextChange);
			inputArea.addEventListener(FlexEvent.DATA_CHANGE, onTranscriptDataChange);
			addChild(inputArea);			
			
			outputArea = new TextArea2();
			outputArea.percentWidth = 100;
			outputArea.percentHeight = 100;
			outputArea.tabIndex = startIndex+1;
			addChild(outputArea);
			
			addEventListener(FlexEvent.CREATION_COMPLETE, onCreationComplete);
		}
		
		private function onCreationComplete(e:FlexEvent):void {
			inputArea.getInternalTextField().addEventListener(KeyboardEvent.KEY_DOWN, onTranscriptKeyDown);
			outputArea.getInternalTextField().type = TextFieldType.DYNAMIC;
			
			removeEventListener(FlexEvent.CREATION_COMPLETE, onCreationComplete);
		}
		
		public function setCurrentTranscript(t:Transcript):void {
			if (transcriptChangeWatcher != null && transcriptChangeWatcher.isWatching()) {
				transcriptChangeWatcher.unwatch();
				transcriptChangeWatcher = null;
			}
			
			currentTranscript = t;
			
			if (currentTranscript != null) {
				transcriptChangeWatcher = BindingUtils.bindProperty(outputArea, "text", currentTranscript, "transcript");
			}
		}
		
		public function transcriptOwnerIDChange(ownerID:String):void {
			if (ownerID == "") {
				//unclaimed text
				inputArea.visible = inputArea.includeInLayout = false;
				outputArea.visible = outputArea.includeInLayout = true;
				inputArea.getInternalTextField().type = TextFieldType.DYNAMIC;
			} else if (ownerID == UserManager.getInstance().getConference().getMyUserId()) {
				//release text
				inputArea.visible = inputArea.includeInLayout = true;
				outputArea.visible = outputArea.includeInLayout = false;
				inputArea.getInternalTextField().type = TextFieldType.INPUT;
				inputArea.text = currentTranscript.transcript;
			} else {
				//claimed by other
				inputArea.visible = inputArea.includeInLayout = false;
				outputArea.visible = outputArea.includeInLayout = true;
				inputArea.getInternalTextField().type = TextFieldType.DYNAMIC;
			}
		}
		
		public function setFontSize(fontSize:int):void {
			inputArea.setStyle("fontSize", fontSize);
			outputArea.setStyle("fontSize", fontSize);
		}
		
		public function setFontFamily(fontFamily:String):void {
			inputArea.setStyle("fontFamily", fontFamily);
			outputArea.setStyle("fontFamily", fontFamily);
		}
		
		public function setTextColor(color:uint):void {
			inputArea.setStyle("color", color);
			outputArea.setStyle("color", color);
		}
		
		public function setBackgroundColor(color:uint):void {
			inputArea.setStyle("backgroundColor", color);
			outputArea.setStyle("backgroundColor", color);
		}
		
		private function onTranscriptTextInput(e:TextEvent):void {
			trace("Text entered: " + e.text + ", carat begin:" + inputArea.selectionBeginIndex + ", end: " + inputArea.selectionEndIndex);
			
			// There is no surefire way to detect whether the internal TextField is in overwrite mode or not. We need to 
			// delay sending the message until after the text changes and then check length. This extra check is only 
			// required if the input is length 1 and nothing is selected because it would be a simple replace otherwise.
			if (e.text.length == 1 && inputArea.selectionBeginIndex == inputArea.selectionEndIndex) {
				_checkForOverwrite = true;
				_lastTextInput = e.text;
				_lastTextLength = inputArea.text.length;
			} else {
				respondToTextChange(e.text, inputArea.selectionBeginIndex, inputArea.selectionEndIndex);
			}
		}
		
		private function onTranscriptTextChange(e:Event):void {
			trace("transcript change: " + inputArea.text);
			
			if (_checkForOverwrite) {
				_checkForOverwrite = false;
				if (inputArea.text.length > _lastTextLength) { // not an overwrite
					respondToTextChange(_lastTextInput, inputArea.selectionBeginIndex-1, inputArea.selectionEndIndex-1);
				} else {											// an overwrite
					respondToTextChange(_lastTextInput, inputArea.selectionBeginIndex-1, inputArea.selectionEndIndex);
				}
				_lastTextInput = null;
				_lastTextLength = 0;
			} else if (_checkForDeletePreviousWord) {
				_checkForDeletePreviousWord = false;
				respondToTextChange("", _lastSelectionIndex-(_lastTextLength-inputArea.text.length), _lastSelectionIndex);
				_lastSelectionIndex = 0;
				_lastTextLength = 0;
			} else if (_checkForDeleteNextWord) {
				_checkForDeleteNextWord = false;
				respondToTextChange("", _lastSelectionIndex, _lastSelectionIndex+(_lastTextLength-inputArea.text.length));
				_lastSelectionIndex = 0;
				_lastTextLength = 0;
			}
		}
		
		private function onTranscriptDataChange(e:FlexEvent):void {
			trace("transcript change");
		}
		
		private function onTranscriptKeyDown(e:KeyboardEvent):void {
			// TODO: Need to make sure I handle the CTRL, SHIFT, and ALT cases because they are different
			var si:int = inputArea.selectionBeginIndex;
			var ei:int = inputArea.selectionEndIndex;
			switch (e.keyCode) {
				case Keyboard.BACKSPACE:
					if (e.ctrlKey || e.altKey) {
						_lastSelectionIndex = ei;
						_lastTextLength = inputArea.text.length;
						_checkForDeletePreviousWord = true;
						return;
					}
					if (si == ei) {
						if (si == 0) {
							return;
						}
						si--;
					}
					respondToTextChange("", si, ei);
					break;
				case Keyboard.DELETE:
					if (e.ctrlKey || e.altKey) {
						_lastSelectionIndex = si;
						_lastTextLength = inputArea.text.length;
						_checkForDeleteNextWord = true;
						return;
					}
					if (si == ei) {
						if (si == inputArea.length+1) {
							return ;
						}
						ei++;
					}
					respondToTextChange("", si, ei);
					break;
				case Keyboard.X:
					if (e.ctrlKey) {
						if (si != ei) {
							respondToTextChange("", si, ei);
						}
					}
					break;
			}
		}
		
		private function respondToTextChange(t:String, si:int, ei:int):void {
			var editHistoryEvent:SendEditCaptionHistoryEvent = new SendEditCaptionHistoryEvent(SendEditCaptionHistoryEvent.SEND_EDIT_CAPTION_HISTORY);
			editHistoryEvent.locale = currentTranscript.locale;
			editHistoryEvent.startIndex = si;
			editHistoryEvent.endIndex = ei;
			editHistoryEvent.text = t;
			
			var dispatcher:Dispatcher = new Dispatcher();
			dispatcher.dispatchEvent(editHistoryEvent);
		}
	}
}
