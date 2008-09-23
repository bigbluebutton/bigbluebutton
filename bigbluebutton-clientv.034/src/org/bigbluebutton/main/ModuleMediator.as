package org.bigbluebutton.main
{
	import org.puremvc.as3.multicore.interfaces.IMediator;
	import org.puremvc.as3.multicore.interfaces.INotification;
	import org.puremvc.as3.multicore.patterns.mediator.Mediator;
	
	public class ModuleMediator extends Mediator implements IMediator
	{
		public function ModuleMediator()
		{
		}
		
		override public function listNotificationInterests():Array{
			return [];
		}
		
		override public function handleNotification(notification:INotification):void{
			
		}
		
		override public function initializeNotifier(key:String):void{
			super.initializeNotifier(key);
		}

	}
}