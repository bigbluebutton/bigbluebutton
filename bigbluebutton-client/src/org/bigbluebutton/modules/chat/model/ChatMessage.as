package org.bigbluebutton.modules.chat.model {
	import be.boulevart.google.ajaxapi.translation.GoogleTranslation;
	import be.boulevart.google.ajaxapi.translation.data.GoogleTranslationResult;
	import be.boulevart.google.events.GoogleApiEvent;
	
	import org.bigbluebutton.common.LogUtil;
	
	public class ChatMessage {
		[Bindable] public var lastSenderId:String;
		[Bindable] public var senderId:String;
		[Bindable] public var senderLanguage:String;
		[Bindable] public var recepientLanguage:String;
		[Bindable] public var translate:Boolean;
		[Bindable] public var color:uint;
			 
			 
		[Bindable] public var name:String;
		[Bindable] public var senderTime:String;
		[Bindable] public var time:String;
		[Bindable] public var lastTime:String;
		[Bindable] public var senderText:String;
		[Bindable] public var translatedText:String;
		[Bindable] public var translated:Boolean = false;
		
		private var g:GoogleTranslation;	 
			 
		public function ChatMessage() {
			g = new GoogleTranslation();
			g.addEventListener(GoogleApiEvent.TRANSLATION_RESULT, onTranslationDone);
		}

		public function translateMessage():void{		
			if (!translate) return;
				
			if ((senderLanguage != recepientLanguage) && !translated) {
//				LogUtil.debug("Translating " + senderText + " from " + senderLanguage + " to " + recepientLanguage + ".");
				g.translate(senderText, senderLanguage, recepientLanguage);
			} else {
//				LogUtil.debug("NOT Translating " + senderText + " from " + senderLanguage + " to " + recepientLanguage + ".");
			}			
		}
			
		private function onTranslationDone(e:GoogleApiEvent):void{
			var result:GoogleTranslationResult = e.data as GoogleTranslationResult;
			
			if (result.result != senderText) {
				translated = true;
				color = 0xCF4C5C;
				translatedText = result.result;
			}			
		}
	}
}