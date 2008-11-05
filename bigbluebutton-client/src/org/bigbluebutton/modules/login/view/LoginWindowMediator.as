package org.bigbluebutton.modules.login.view
{
	import org.puremvc.as3.multicore.interfaces.IMediator;
	import org.puremvc.as3.multicore.interfaces.INotification;
	import org.puremvc.as3.multicore.patterns.mediator.Mediator;

	public class LoginWindowMediator extends Mediator implements IMediator
	{
		public function LoginWindowMediator(mediatorName:String=null, viewComponent:Object=null)
		{
			//TODO: implement function
			super(mediatorName, viewComponent);
		}
		
		public function sendNotification(notificationName:String, body:Object=null, type:String=null):void
		{
			//TODO: implement function
		}
		
		public function initializeNotifier(key:String):void
		{
			//TODO: implement function
		}
		
		public function getMediatorName():String
		{
			//TODO: implement function
			return null;
		}
		
		public function getViewComponent():Object
		{
			//TODO: implement function
			return null;
		}
		
		public function setViewComponent(viewComponent:Object):void
		{
			//TODO: implement function
		}
		
		public function listNotificationInterests():Array
		{
			//TODO: implement function
			return null;
		}
		
		public function handleNotification(notification:INotification):void
		{
			//TODO: implement function
		}
		
		public function onRegister():void
		{
			//TODO: implement function
		}
		
		public function onRemove():void
		{
			//TODO: implement function
		}
		
	}
}