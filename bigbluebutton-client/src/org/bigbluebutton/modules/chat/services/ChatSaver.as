package org.bigbluebutton.modules.chat.services
{
	import flash.events.Event;
	import flash.events.IOErrorEvent;
	import flash.net.FileReference;
	
	import mx.controls.Alert;
	
	import org.bigbluebutton.common.toaster.Toaster;
	import org.bigbluebutton.common.toaster.message.ToastType;
	import org.bigbluebutton.core.model.LiveMeeting;
	import org.bigbluebutton.modules.chat.events.ChatSaveEvent;
	import org.bigbluebutton.modules.chat.model.ChatModel;
	import org.bigbluebutton.modules.chat.model.GroupChat;
	import org.bigbluebutton.util.i18n.ResourceUtil;

	public class ChatSaver
	{
		public function ChatSaver(){}
		
		public function saveChatToFile(e:ChatSaveEvent):void{
			// Hardcode to save only Main public chat for now.
			var chatId: String = ChatModel.MAIN_PUBLIC_CHAT;
			
			var chat: GroupChat = LiveMeeting.inst().chats.getGroupChat(chatId);
			var filename:String = chat.name;
			var textToExport:String = chat.getAllMessageAsString();
			var fileRef:FileReference = new FileReference();
			
			fileRef.addEventListener(Event.COMPLETE, function(evt:Event):void {
				Alert.show(ResourceUtil.getInstance().getString('bbb.chat.save.complete'), "", Alert.OK);
				//Toaster.toast(ResourceUtil.getInstance().getString('bbb.chat.save.complete'), ToastType.SUCCESS);
			});
			fileRef.addEventListener(IOErrorEvent.IO_ERROR, function(evt:Event):void {
				Alert.show(ResourceUtil.getInstance().getString('bbb.chat.save.ioerror'), "", Alert.OK);
				//Toaster.toast(ResourceUtil.getInstance().getString('bbb.chat.save.ioerror'), ToastType.ERROR)
			});
			
			var cr:String = String.fromCharCode(13);
			var lf:String = String.fromCharCode(10);
			var crlf:String = String.fromCharCode(13, 10);
			
			textToExport = textToExport.replace(new RegExp(crlf, "g"), '\n');
			textToExport = textToExport.replace(new RegExp(cr, "g"), '\n');
			textToExport = textToExport.replace(new RegExp(lf, "g"), '\n');
			textToExport = textToExport.replace(new RegExp('\n', "g"), crlf);
			
			fileRef.save(textToExport, filename + ".txt");
		}
	}
}

