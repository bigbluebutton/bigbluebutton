package org.bigbluebutton.modules.notes.view
{
	import org.puremvc.as3.multicore.interfaces.IMediator;
	import org.puremvc.as3.multicore.interfaces.INotification;
	import org.puremvc.as3.multicore.patterns.mediator.Mediator;
	
	public class NotesWindowMediator extends Mediator implements IMediator
	{
		public static const NAME:String = "NotesWindowMediator";
		
		public function NotesWindowMediator(view:NotesWindow)
		{
			super(NAME, view);
		}
		
		override public function listNotificationInterests():Array{
			return [];
		}
		
		override public function handleNotification(notification:INotification):void{
			
		}

	}
}