package org.bigbluebutton.lib.chat.models {
	
	import mx.collections.ArrayCollection;
	
	import org.bigbluebutton.lib.chat.utils.ChatUtil;
	import org.osflash.signals.ISignal;
	import org.osflash.signals.Signal;
	
	public class ChatMessages {
		
		[Bindable]
		public var messages:ArrayCollection = new ArrayCollection();
		
		private var _newMessages:uint = 0;
		
		private var _autoTranslate:Boolean = false;
		
		private var _chatMessageChangeSignal:ISignal = new Signal();
		
		public function numMessages():int {
			return messages.length;
		}
		
		public function newChatMessage(msg:ChatMessageVO):void {
			var cm:ChatMessage = new ChatMessage();
			if (messages.length == 0) {
				cm.lastSenderId = "";
				cm.lastTime = cm.time;
			} else {
				cm.lastSenderId = getLastSender();
				cm.lastTime = getLastTime();
			}
			cm.senderId = msg.fromUserID;
			cm.senderLanguage = msg.fromLang;
			cm.receiverLanguage = ChatUtil.getUserLang();
			cm.translate = _autoTranslate;
			cm.translatedText = msg.message;
			cm.senderText = msg.message;
			cm.name = msg.fromUsername;
			cm.senderColor = uint(msg.fromColor);
			cm.translatedColor = uint(msg.fromColor);
			cm.fromTime = msg.fromTime;
			cm.fromTimezoneOffset = msg.fromTimezoneOffset;
			var sentTime:Date = new Date();
			sentTime.setTime(cm.fromTime);
			cm.time = ChatUtil.getHours(sentTime) + ":" + ChatUtil.getMinutes(sentTime);
			messages.addItem(cm);
			_newMessages++;
			chatMessageChange(cm.senderId);
		}
		
		public function getAllMessageAsString():String {
			var allText:String = "";
			for (var i:int = 0; i < messages.length; i++) {
				var item:ChatMessage = messages.getItemAt(i) as ChatMessage;
				allText += "\n" + item.name + " - " + item.time + " : " + item.translatedText;
			}
			return allText;
		}
		
		private function getLastSender():String {
			var msg:ChatMessage = messages.getItemAt(messages.length - 1) as ChatMessage;
			return msg.senderId;
		}
		
		private function getLastTime():String {
			var msg:ChatMessage = messages.getItemAt(messages.length - 1) as ChatMessage;
			return msg.time;
		}
		
		public function get chatMessageChangeSignal():ISignal {
			return _chatMessageChangeSignal;
		}
		
		public function set chatMessageChangeSignal(signal:ISignal):void {
			_chatMessageChangeSignal = signal;
		}
		
		private function chatMessageChange(UserID:String = null):void {
			if (_chatMessageChangeSignal) {
				_chatMessageChangeSignal.dispatch(UserID);
			}
		}
		
		public function get newMessages():uint {
			return _newMessages;
		}
		
		public function resetNewMessages():void {
			_newMessages = 0;
		}
	}
}
