/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
*
* Copyright (c) 2010 BigBlueButton Inc. and by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU Lesser General Public License as published by the Free Software
* Foundation; either version 2.1 of the License, or (at your option) any later
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
package org.bigbluebutton.modules.chat.model {
	import be.boulevart.google.ajaxapi.translation.GoogleTranslation;
	import be.boulevart.google.ajaxapi.translation.data.GoogleTranslationResult;
	import be.boulevart.google.events.GoogleApiEvent;
	
	import org.bigbluebutton.common.LogUtil;
	
	public class ChatMessage {
		[Bindable] public var lastSenderId:String;
		[Bindable] public var senderId:String;
		[Bindable] public var senderLanguage:String;
		[Bindable] public var receiverLanguage:String;
		[Bindable] public var translate:Boolean;
		[Bindable] public var senderColor:uint;
		[Bindable] public var translateLocale:String = "";	 
		[Bindable] public var translatedLocaleTooltip:String = "";
			 
		[Bindable] public var name:String;
		[Bindable] public var senderTime:String;
		[Bindable] public var time:String;
		[Bindable] public var lastTime:String;
		[Bindable] public var senderText:String;
		[Bindable] public var translatedText:String;
		[Bindable] public var translated:Boolean = false;
		[Bindable] public var translatedColor:uint;
		
		private var g:GoogleTranslation;	 
			 
		public function ChatMessage() {
			g = new GoogleTranslation();
			g.addEventListener(GoogleApiEvent.TRANSLATION_RESULT, onTranslationDone);
		}

		public function translateMessage():void {		
			if (!translate) return;
				
			if ((senderLanguage != receiverLanguage) && !translated) {
//				LogUtil.debug("Translating " + senderText + " from " + senderLanguage + " to " + receiverLanguage + ".");
				g.translate(senderText, senderLanguage, receiverLanguage);
			} else {
//				LogUtil.debug("NOT Translating " + senderText + " from " + senderLanguage + " to " + receiverLanguage + ".");
			}			
		}
			
		private function onTranslationDone(e:GoogleApiEvent):void {
			var result:GoogleTranslationResult = e.data as GoogleTranslationResult;

			if (result.result != senderText) {
				translated = true;
//				LogUtil.debug("Translated " + senderText + "to " + result.result + ".");

				translatedText = result.result;

				if (lastSenderId != senderId)
					translateLocale = "<i>" + senderLanguage + "->" + receiverLanguage + "</i>";
				translatedColor = 0xCF4C5C;
			} 
		}
	}
}