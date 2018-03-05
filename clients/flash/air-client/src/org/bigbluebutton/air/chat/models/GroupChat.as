package org.bigbluebutton.air.chat.models {
	import mx.collections.ArrayCollection;
	
	import org.bigbluebutton.air.chat.utils.ChatUtil;
	import org.osflash.signals.Signal;
	
	[Bindable]
	public class GroupChat {
		public static const PUBLIC:String = "PUBLIC_ACCESS";
		
		public static const PRIVATE:String = "PRIVATE_ACCESS";
		
		public var chatId:String;
		
		public var name:String;
		
		public var isPublic:Boolean;
		
		public var partnerId:String;
		
		public var messages:ArrayCollection = new ArrayCollection();
		
		public var newMessages:Number = 0;
		
		public var newMessageSignal:Signal = new Signal();
		
		public function GroupChat(chatId:String, name:String, isPublic:Boolean, partnerId:String) {
			this.chatId = chatId;
			this.name = name;
			this.isPublic = isPublic;
			this.partnerId = partnerId;
		}
		
		public function addChatHistory(messages:Array):void {
			for each (var message:ChatMessageVO in messages) {
				convertAndAddChatMessage(message);
			}
			newMessages += messages.length;
			newMessageSignal.dispatch(chatId);
		}
		
		public function clearMessages():void {
			messages.removeAll();
			newMessages = 0;
			newChatMessage(generateSystemMessage("The public chat history was cleared by a moderator"));
		}
		
		public function newChatMessage(message:ChatMessageVO):void {
			convertAndAddChatMessage(message);
			newMessages++;
			newMessageSignal.dispatch(chatId);
		}
		
		private function convertAndAddChatMessage(message:ChatMessageVO):void {
			var cm:ChatMessage = new ChatMessage();
			cm.senderId = message.fromUserId;
			cm.name = message.fromUsername;
			cm.color = uint(message.fromColor);
			cm.message = message.message;
			cm.fromTime = message.fromTime;
			var sentTime:Date = new Date();
			sentTime.setTime(cm.fromTime);
			cm.time = ChatUtil.getHours(sentTime) + ":" + ChatUtil.getMinutes(sentTime);
			
			if (messages.length == 0) {
				cm.sameSender = false;
				cm.sameTime = false;
			} else {
				var lastMessage:ChatMessage = messages.getItemAt(messages.length - 1) as ChatMessage;
				cm.sameSender = cm.senderId == lastMessage.senderId;
				cm.sameTime = cm.time == lastMessage.time;
			}
			
			messages.addItem(cm);
		}
		
		public function getAllMessageAsString():String {
			var allText:String = "";
			for (var i:int = 0; i < messages.length; i++) {
				var item:ChatMessage = messages.getItemAt(i) as ChatMessage;
				allText += "\n" + item.name + " - " + item.time + " : " + item.message;
			}
			return allText;
		}
		
		private function generateSystemMessage(text:String):ChatMessageVO {
			var newMessageVO:ChatMessageVO = new ChatMessageVO();
			newMessageVO.fromTime = (new Date()).time;
			newMessageVO.message = "<b><i>"+text+"</i></b>";
			newMessageVO.fromUserId = "";
			newMessageVO.fromUsername = "";
			newMessageVO.fromColor = "0x000000";
			return newMessageVO;
		}
	}
}
