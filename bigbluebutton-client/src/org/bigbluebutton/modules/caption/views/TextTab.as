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
	import com.asfusion.mate.events.Listener;
	
	import flash.events.Event;
	import flash.events.KeyboardEvent;
	import flash.events.MouseEvent;
	import flash.events.TextEvent;
	import flash.events.TimerEvent;
	import flash.text.TextFieldType;
	import flash.ui.Keyboard;
	import flash.utils.Timer;
	
	import mx.binding.utils.BindingUtils;
	import mx.binding.utils.ChangeWatcher;
	import mx.containers.VBox;
	import mx.controls.Alert;
	import mx.controls.Button;
	import mx.events.FlexEvent;
	
	import org.bigbluebutton.common.events.LocaleChangeEvent;
	import org.bigbluebutton.core.UsersUtil;
	import org.bigbluebutton.modules.caption.events.SendEditCaptionHistoryEvent;
	import org.bigbluebutton.modules.caption.events.SendUpdateCaptionOwnerEvent;
	import org.bigbluebutton.modules.caption.model.CaptionOptions;
	import org.bigbluebutton.modules.caption.model.Transcript;
	import org.bigbluebutton.util.i18n.ResourceUtil;

	public class TextTab extends VBox {
		
		private const LEN_TO_SEND:int = 7;
		private const REP_TO_SEND:int = 3;
		private const TIME_TO_SEND:int = 1000;
		
		private var _startIndex:int = -1;
		private var _endIndex:int = -1;
		private var _accText:String = "";
		
		private var _sendTimer:Timer;
		
		private var _captionOptions:CaptionOptions;
		
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
		private var claimButton:Button;
		
		private var focusSwitchTimer:Timer;
		
		public function TextTab(startIndex:int, captionOptions:CaptionOptions) {
			super();
			
			_captionOptions = captionOptions;
			
			setStyle("horizontalAlign", "center");
			
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
			outputArea.addEventListener(FlexEvent.VALUE_COMMIT, onOutputAreaValueCommit);
			addChild(outputArea);
			
			claimButton = new Button();
			claimButton.height = 22; 
			claimButton.visible = false;
			claimButton.includeInLayout = false;
			claimButton.styleName = "mainActionButton";
			claimButton.tabIndex = startIndex+1;
			claimButton.addEventListener(MouseEvent.CLICK, onClaimButtonClick);
			addChild(claimButton);
			
			_sendTimer = new Timer(TIME_TO_SEND, 1);
			_sendTimer.addEventListener(TimerEvent.TIMER_COMPLETE, onSendTimerComplete);
			
			addEventListener(FlexEvent.CREATION_COMPLETE, onCreationComplete);
			
			var localeListener:Listener = new Listener();
			localeListener.type = LocaleChangeEvent.LOCALE_CHANGED;
			localeListener.method = localeChanged;
			
			resourcesChanged();
		}
		
		private function onCreationComplete(e:FlexEvent):void {
			inputArea.getInternalTextField().addEventListener(KeyboardEvent.KEY_DOWN, onTranscriptKeyDown);
			outputArea.getInternalTextField().type = TextFieldType.DYNAMIC;
			
			removeEventListener(FlexEvent.CREATION_COMPLETE, onCreationComplete);
		}
		
		private function localeChanged(e:Event):void{
			resourcesChanged();
		}
		
		override protected function resourcesChanged():void{
			super.resourcesChanged();
			
			if (inputArea != null) {
				inputArea.toolTip = ResourceUtil.getInstance().getString('bbb.caption.transcript.inputArea.toolTip');
			}
			
			if (outputArea != null) {
				outputArea.toolTip = ResourceUtil.getInstance().getString('bbb.caption.transcript.outputArea.toolTip');
			}
			
			if (claimButton != null) {
				claimButton.label = ResourceUtil.getInstance().getString('bbb.caption.option.takeowner');
				claimButton.toolTip = ResourceUtil.getInstance().getString('bbb.caption.option.takeowner.tooltip');
			}
		}
		
		public function delayedFocusTextArea():void {
			focusSwitchTimer = new Timer(250, 1);
			focusSwitchTimer.addEventListener(TimerEvent.TIMER, function():void {
				focusTextArea();
			});
			focusSwitchTimer.start();
		}
		
		public function focusTextArea():void {
			var areaToFocus:TextArea2 = (inputArea.visible ? inputArea : outputArea);
			areaToFocus.setFocus();
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
			//check focus targets before switching visibility
			var focusedTextArea:TextArea2 = null;
			
			if (ownerID == UsersUtil.getMyUserID()) {
				claimButton.visible = claimButton.includeInLayout = false;
				
				if (focusManager && focusManager.getFocus() == outputArea) {
					delayedFocusTextArea();
				}
				
				//release text
				inputArea.visible = inputArea.includeInLayout = true;
				outputArea.visible = outputArea.includeInLayout = false;
				inputArea.getInternalTextField().type = TextFieldType.INPUT;
				inputArea.text = currentTranscript.transcript;
			} else {
				claimButton.visible = claimButton.includeInLayout = UsersUtil.amIModerator();
				
				if (focusManager && focusManager.getFocus() == outputArea) {
					delayedFocusTextArea();
				}
				
				//unclaimed text
				inputArea.visible = inputArea.includeInLayout = false;
				outputArea.visible = outputArea.includeInLayout = true;
				inputArea.getInternalTextField().type = TextFieldType.DYNAMIC;
				
				resetOverwriteVars();
				resetTextToSendVars();
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
		
		private function onOutputAreaValueCommit(e:FlexEvent):void {
			outputArea.verticalScrollPosition = outputArea.maxVerticalScrollPosition;
		}
		
		private function onClaimButtonClick(e:MouseEvent):void {
			claimTranscript(currentTranscript.locale, currentTranscript.localeCode, true);
			
			delayedFocusTextArea();
		}
		
		private function claimTranscript(locale:String, localeCode:String, claim:Boolean):void {
			var updateCaptionOwnerEvent:SendUpdateCaptionOwnerEvent = new SendUpdateCaptionOwnerEvent(SendUpdateCaptionOwnerEvent.SEND_UPDATE_CAPTION_OWNER_EVENT);
			updateCaptionOwnerEvent.locale = locale;
			updateCaptionOwnerEvent.localeCode = localeCode;
			updateCaptionOwnerEvent.claim = claim;
			
			var dispatcher:Dispatcher = new Dispatcher();
			dispatcher.dispatchEvent(updateCaptionOwnerEvent);
		}
		
		private function onTranscriptTextInput(e:TextEvent):void {
			//trace("Text entered: " + e.text + ", carat begin:" + inputArea.selectionBeginIndex + ", end: " + inputArea.selectionEndIndex);
			
			if (e.text.length > _captionOptions.maxPasteLength) {
				e.preventDefault();
				Alert.show(ResourceUtil.getInstance().getString("bbb.caption.transcript.pastewarning.text", [_captionOptions.maxPasteLength, e.text.length]), ResourceUtil.getInstance().getString("bbb.caption.transcript.pastewarning.title"), Alert.OK);
				return;
			}
			
			// There is no surefire way to detect whether the internal TextField is in overwrite mode or not. We need to 
			// delay sending the message until after the text changes and then check length. This extra check is only 
			// required if the input is length 1 and nothing is selected because it would be a simple replace otherwise.
			if (e.text.length == 1 && inputArea.selectionBeginIndex == inputArea.selectionEndIndex) {
				_checkForOverwrite = true;
				_lastTextInput = e.text;
				_lastTextLength = inputArea.getInternalTextField().text.length; // ****** length is the problem *******
				//trace("input text: '"+inputArea.text+"'  char0 " + inputArea.text.charCodeAt(0)+", char1 "+inputArea.text.charCodeAt(1));
				//trace("** input len: "+ inputArea.text.length + ", trans len: " + currentTranscript.transcript.length + " ***");
				//trace("** internal len: "+ inputArea.getInternalTextField().text.length + " **");
			} else {
				respondToTextChange(e.text, inputArea.selectionBeginIndex, inputArea.selectionEndIndex);
			}
		}
		
		private function onTranscriptTextChange(e:Event):void {
			//trace("transcript change: " + inputArea.text);
			//trace("** input len: "+ inputArea.text.length + ", trans len: " + currentTranscript.transcript.length + " ***");
			if (_checkForOverwrite) {
				_checkForOverwrite = false;
				if (inputArea.getInternalTextField().text.length > _lastTextLength) { // not an overwrite
					respondToTextChange(_lastTextInput, inputArea.selectionBeginIndex-1, inputArea.selectionEndIndex-1);
				} else {											// an overwrite
					respondToTextChange(_lastTextInput, inputArea.selectionBeginIndex-1, inputArea.selectionEndIndex);
				}
				_lastTextInput = null;
				_lastTextLength = 0;
			} else if (_checkForDeletePreviousWord) {
				_checkForDeletePreviousWord = false;
				respondToTextChange("", _lastSelectionIndex-(_lastTextLength-inputArea.getInternalTextField().text.length), _lastSelectionIndex);
				_lastSelectionIndex = 0;
				_lastTextLength = 0;
			} else if (_checkForDeleteNextWord) {
				_checkForDeleteNextWord = false;
				respondToTextChange("", _lastSelectionIndex, _lastSelectionIndex+(_lastTextLength-inputArea.getInternalTextField().text.length));
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
						_lastTextLength = inputArea.getInternalTextField().text.length;
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
						_lastTextLength = inputArea.getInternalTextField().text.length;
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
		
		private function resetOverwriteVars():void {
			_checkForOverwrite = false;
			_checkForDeletePreviousWord = false;
			_checkForDeleteNextWord = false;
			_lastTextInput = null;
			_lastTextLength = -1;
			_lastSelectionIndex = -1;
		}
		
		private function respondToTextChange(t:String, si:int, ei:int):void {
			if (_startIndex == -1) {
				_startIndex = si;
				_endIndex = ei;
				_accText = t;
			} else if (ei < _startIndex || si > _startIndex + _accText.length) {
				// edited away from current spot
				sendTextToServer();
			
				_startIndex = si;
				_endIndex = ei;
				_accText = t;
			} else {
				var tempText:String = _accText;
				var subStart:int = si - _startIndex;
				
				tempText = _accText.substr(0, Math.max(subStart, 0)) + t + _accText.substr(subStart+(ei-si));
				
				if (ei - _startIndex > _accText.length) _endIndex += ei - _accText.length - _startIndex;
				if (si < _startIndex) _startIndex = si;
				_accText = tempText;
			}
			
			// start/restart the timer
			if (_sendTimer.running) _sendTimer.stop();
			_sendTimer.start();
			
			// check length
			if (_accText.length >= LEN_TO_SEND || _endIndex - _startIndex >= REP_TO_SEND) {
				sendTextToServer();
			}
		}
		
		private function onSendTimerComplete(e:TimerEvent):void {
			sendTextToServer();
		}
		
		private function sendTextToServer():void {
			if (_startIndex >= 0) {
				var editHistoryEvent:SendEditCaptionHistoryEvent = new SendEditCaptionHistoryEvent(SendEditCaptionHistoryEvent.SEND_EDIT_CAPTION_HISTORY);
				editHistoryEvent.locale = currentTranscript.locale;
				editHistoryEvent.localeCode = currentTranscript.localeCode;
				editHistoryEvent.startIndex = _startIndex;
				editHistoryEvent.endIndex = _endIndex;
				editHistoryEvent.text = _accText;
				
				var dispatcher:Dispatcher = new Dispatcher();
				dispatcher.dispatchEvent(editHistoryEvent);
				
				// reset variables after sending
				resetTextToSendVars();
			}
		}
		
		private function resetTextToSendVars():void {
			_startIndex = -1;
			_endIndex = -1;
			_accText = "";
		}
	}
}
