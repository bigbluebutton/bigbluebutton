package org.bigbluebutton.main
{
	import org.bigbluebutton.main.model.ModulesProxy;
	import org.puremvc.as3.multicore.interfaces.IMediator;
	import org.puremvc.as3.multicore.interfaces.INotification;
	import org.puremvc.as3.multicore.patterns.mediator.Mediator;

	public class MainApplicationMediator extends Mediator implements IMediator
	{
		public static const NAME:String = 'MainApplicationMediator';
		
		public function MainApplicationMediator(mediatorName:String=null, viewComponent:Object=null)
		{
			super(NAME, viewComponent);
		}
		
		override public function listNotificationInterests():Array
		{
			return [
					MainApplicationConstants.APP_STARTED,
					MainApplicationConstants.APP_MODEL_INITIALIZED,
					MainApplicationConstants.MODULE_LOADED,
					MainApplicationConstants.MODULES_START,
					MainApplicationConstants.MODULE_STARTED,
					MainApplicationConstants.USER_LOGGED_IN,
					MainApplicationConstants.LOGOUT
					];
		}
		
		override public function handleNotification(notification:INotification):void
		{
			switch(notification.getName()){
				case MainApplicationConstants.APP_STARTED:
					trace(NAME + "::Received APP_STARTED");
					facade.sendNotification(MainApplicationConstants.APP_MODEL_INITIALIZE);
					break;
				case MainApplicationConstants.APP_MODEL_INITIALIZED:
					trace(NAME + "::Received APP_MODEL_INITIALIZED");
					proxy.loadModule("ViewersModule");
					//proxy.loadModule("ListenersModule");
					break;
				case MainApplicationConstants.MODULE_LOADED:
					trace(NAME + "::Received MODULE_LOADED");
					facade.sendNotification(MainApplicationConstants.MODULE_START, notification.getBody() as String);
					//proxy.startModule(notification.getBody() as String);
					break;
				case MainApplicationConstants.LOGOUT:
					trace(NAME + '::Received LOGOUT');
					proxy.stopModule("ChatModule");
					proxy.stopModule("PresentationModule");
					proxy.stopModule("ViewersModule");
					break;
				case MainApplicationConstants.MODULE_STARTED:
					trace(NAME + '::Received MODULE_STARTED for ' + notification.getBody() as String);
					//sendNotification(MainApplicationConstants.OPEN_WINDOW, "ChatModule");
					break;	
				case MainApplicationConstants.USER_LOGGED_IN:
					trace(NAME + '::Received USER_LOGGED_IN');
					//proxy.loadModule("ChatModule");
					//proxy.loadModule("PresentationModule");
					proxy.loadModule("ListenersModule");
					break;
			}
		}		
		
		private function get proxy():ModulesProxy {
			return facade.retrieveProxy(ModulesProxy.NAME) as ModulesProxy;
		}		
	}
}