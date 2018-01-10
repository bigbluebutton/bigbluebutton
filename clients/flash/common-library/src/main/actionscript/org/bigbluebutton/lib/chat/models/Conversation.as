package org.bigbluebutton.lib.chat.models {
	import mx.collections.ArrayCollection;
	
	import org.bigbluebutton.lib.chat.utils.ChatUtil;
	
	[Bindable]
	public class Conversation {
		public var userId:String;
		
		public var userName:String;
		
		public var isPublic:Boolean;
		
		public var messages:ArrayCollection = new ArrayCollection();
		
		public var newMessages:Number = 0;
		
		public function Conversation(userId:String, userName:String, isPublic:Boolean) {
			this.userId = userId;
			this.userName = userName;
			this.isPublic = isPublic;
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
			cm.senderId = msg.fromUserId;
			cm.name = msg.fromUsername;
			cm.senderColor = uint(msg.fromColor);
			cm.message = msg.message;
			cm.fromTime = msg.fromTime;
			var sentTime:Date = new Date();
			sentTime.setTime(cm.fromTime);
			cm.time = ChatUtil.getHours(sentTime) + ":" + ChatUtil.getMinutes(sentTime);
			messages.addItem(cm);
			newMessages++;
		}
		
		private function getLastSender():String {
			var msg:ChatMessage = messages.getItemAt(messages.length - 1) as ChatMessage;
			return msg.senderId;
		}
		
		private function getLastTime():String {
			var msg:ChatMessage = messages.getItemAt(messages.length - 1) as ChatMessage;
			return msg.time;
		}
		
		public function getAllMessageAsString():String {
			var allText:String = "";
			for (var i:int = 0; i < messages.length; i++) {
				var item:ChatMessage = messages.getItemAt(i) as ChatMessage;
				allText += "\n" + item.name + " - " + item.time + " : " + item.message;
			}
			return allText;
		}
	}
}
