package org.bigbluebutton.modules.chat.view
{
	import org.bigbluebutton.modules.chat.view.components.ChatBox;
	import org.puremvc.as3.multicore.interfaces.IMediator;
	import org.puremvc.as3.multicore.interfaces.INotification;
	import org.puremvc.as3.multicore.patterns.mediator.Mediator;
	
	public class ChatBoxMediator extends Mediator implements IMediator
	{

		public function ChatBoxMediator(chatBox:ChatBox)
		{
			super(chatBox.name, chatBox);
			chatBox.label = chatBox.id;
		}
		
		public function get chatBox():ChatBox{
			return viewComponent as ChatBox;
		}
		
		override public function listNotificationInterests():Array{
			return [];
		}
		
		override public function handleNotification(notification:INotification):void{
			
		}
		
		public function showMessage(message:String):void{
			chatBox.showNewMessage(message);
			chatBox.setMessageUnread();
		}

	}
}