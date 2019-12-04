package org.bigbluebutton.modules.chat.services
{
	import flash.system.System;
	
	import mx.controls.Alert;
	
	import org.bigbluebutton.common.toaster.Toaster;
	import org.bigbluebutton.common.toaster.message.ToastType;
	import org.bigbluebutton.core.model.LiveMeeting;
	import org.bigbluebutton.modules.chat.events.ChatCopyEvent;
	import org.bigbluebutton.modules.chat.model.GroupChat;
	import org.bigbluebutton.util.i18n.ResourceUtil;
	
	public class ChatCopy
	{
		public function copyAllText(e:ChatCopyEvent):void {
			var chatId: String = e.chatId;
			var chat: GroupChat = LiveMeeting.inst().chats.getGroupChat(chatId);
			System.setClipboard(chat.getAllMessageAsString());
			Alert.show(ResourceUtil.getInstance().getString('bbb.chat.copy.complete'), "", Alert.OK);
			//Toaster.toast(ResourceUtil.getInstance().getString('bbb.chat.copy.complete'), ToastType.SUCCESS);
		}
	}
}
