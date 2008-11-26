package org.bigbluebutton.main
{
	import org.bigbluebutton.main.model.ModulesProxy;
	import org.puremvc.as3.multicore.interfaces.IMediator;
	import org.puremvc.as3.multicore.interfaces.INotification;
	import org.puremvc.as3.multicore.patterns.mediator.Mediator;

	public class MainApplicationMediator extends Mediator implements IMediator
	{
		public static const NAME:String = 'MainApplicationMediator';
		
		private var chatLoaded:Boolean = false;
		private var presentLoaded:Boolean = false;
		private var listenerLoaded:Boolean = false;
		private var viewerLoaded:Boolean = false;
		private var videoLoaded:Boolean = false;
		
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
					MainApplicationConstants.RESTART_MODULE,
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
					//proxy.loadModule("VideoModule");
					proxy.loadModule("ChatModule");
					break;
				case MainApplicationConstants.MODULE_LOADED:
					trace(NAME + "::Received MODULE_LOADED");
					var ml:String = notification.getBody() as String;
					
					if (ml == "ViewersModule") {
						viewerLoaded = true;
					}
					
					if (ml == "ChatModule") {
						chatLoaded = true;
						proxy.loadModule("PresentationModule");
					}
					if (ml == "PresentationModule") {
						presentLoaded = true;
						proxy.loadModule("ListenersModule");
					}
					if (ml == "ListenersModule") {
						listenerLoaded = true;
						proxy.loadModule("VideoModule");
					}
					if (ml == "VideoModule") {
						videoLoaded = true;
						proxy.loadModule("ViewersModule");
					}
					
					facade.sendNotification(MainApplicationConstants.LOADED_MODULE, ml);
					
					// SHortcircuit videomodule start. This is only for refactoring of videoModule.
					//facade.sendNotification(MainApplicationConstants.MODULE_START, "VideoModule");
					
					if (viewerLoaded && chatLoaded && presentLoaded && listenerLoaded) {
						facade.sendNotification(MainApplicationConstants.MODULE_START, "ViewersModule");
					}
					
					//proxy.startModule(notification.getBody() as String);
					break;
				case MainApplicationConstants.LOGOUT:
					trace(NAME + '::Received LOGOUT');
					proxy.stopModule("ChatModule");
					proxy.stopModule("PresentationModule");
					proxy.stopModule("ListenersModule");
					proxy.stopModule("VideoModule");
					proxy.stopModule("ViewersModule");					
					break;
				case MainApplicationConstants.RESTART_MODULE:
					trace(NAME + '::Received RESTART_MODULE for ' + notification.getBody() as String);
					proxy.stopModule(notification.getBody() as String);
					facade.sendNotification(MainApplicationConstants.MODULE_START, notification.getBody());
					break;	
				case MainApplicationConstants.USER_LOGGED_IN:
					trace(NAME + '::Received USER_LOGGED_IN');
					facade.sendNotification(MainApplicationConstants.MODULE_START, "ChatModule");
					facade.sendNotification(MainApplicationConstants.MODULE_START, "PresentationModule");
					facade.sendNotification(MainApplicationConstants.MODULE_START, "ListenersModule");
					facade.sendNotification(MainApplicationConstants.MODULE_START, "VideoModule");
					break;
			}
		}		
		
		private function get proxy():ModulesProxy {
			return facade.retrieveProxy(ModulesProxy.NAME) as ModulesProxy;
		}		
	}
}