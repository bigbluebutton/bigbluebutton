package org.bigbluebutton.modules.chat.services
{
	import flash.events.Event;
	import flash.events.IOErrorEvent;
	import flash.net.FileReference;
	
	import org.bigbluebutton.common.toaster.Toaster;
	import org.bigbluebutton.common.toaster.message.ToastType;
	import org.bigbluebutton.modules.chat.events.ChatSaveEvent;
	import org.bigbluebutton.modules.chat.model.ChatConversation;
	import org.bigbluebutton.util.i18n.ResourceUtil;

	public class ChatSaver
	{
		public function ChatSaver(){}

		public function saveChatToFile(e:ChatSaveEvent):void{
			var chat:ChatConversation = e.chatMessages;
			var filename:String = e.filename;

			var textToExport:String = chat.getAllMessageAsString();
			var fileRef:FileReference = new FileReference();

			fileRef.addEventListener(Event.COMPLETE, function(evt:Event):void {
				Toaster.toast(ResourceUtil.getInstance().getString('bbb.chat.save.complete'), ToastType.SUCCESS);
			});
			fileRef.addEventListener(IOErrorEvent.IO_ERROR, function(evt:Event):void {
				Toaster.toast(ResourceUtil.getInstance().getString('bbb.chat.save.ioerror'), ToastType.ERROR)
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
