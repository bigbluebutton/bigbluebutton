package org.bigbluebutton.modules.listeners
{
	import org.bigbluebutton.common.IBigBlueButtonModule;
	import org.bigbluebutton.common.messaging.Endpoint;
	import org.bigbluebutton.common.messaging.EndpointMessageConstants;
	import org.bigbluebutton.common.messaging.Router;
	import org.bigbluebutton.modules.listeners.model.ListenersProxy;
	import org.puremvc.as3.multicore.interfaces.IMediator;
	import org.puremvc.as3.multicore.interfaces.INotification;
	import org.puremvc.as3.multicore.patterns.mediator.Mediator;
	import org.puremvc.as3.multicore.utilities.pipes.interfaces.IPipeMessage;

	public class ListenersModuleEndpointMediator extends Mediator implements IMediator
	{
		public static const NAME:String = "ListenersModuleEndpointMediator";
		
		private var _module:IBigBlueButtonModule;
		private var _router:Router;
		private var _endpoint:Endpoint;		
		private static const TO_LISTENERS_MODULE:String = "TO_LISTENERS_MODULE";
		private static const FROM_LISTENERS_MODULE:String = "FROM_LISTENERS_MODULE";
			
		public function ListenersModuleEndpointMediator(module:IBigBlueButtonModule)
		{
			super(NAME,module);
			_module = module;
			_router = module.router
			trace(NAME + ":Creating endpoint for ListenersModule");
			_endpoint = new Endpoint(_router, FROM_LISTENERS_MODULE, TO_LISTENERS_MODULE, messageReceiver);	
		}
		
		override public function getMediatorName():String
		{
			return NAME;
		}
				
		override public function listNotificationInterests():Array
		{
			return [
				ListenersModuleConstants.STARTED,
				ListenersModuleConstants.CONNECTED,
				ListenersModuleConstants.DISCONNECTED,
				ListenersModuleConstants.ADD_WINDOW,
				ListenersModuleConstants.REMOVE_WINDOW
			];
		}
		
		override public function handleNotification(notification:INotification):void
		{
			switch(notification.getName()){
				case ListenersModuleConstants.STARTED:
					trace(NAME + ":Sending MODULE_STARTED message to main");
					_endpoint.sendMessage(EndpointMessageConstants.MODULE_STARTED, 
							EndpointMessageConstants.TO_MAIN_APP, _module.moduleId);
					facade.sendNotification(ListenersModuleConstants.OPEN_WINDOW);
					break;
				case ListenersModuleConstants.DISCONNECTED:
					trace(NAME + ':Sending MODULE_STOPPED message to main');
					facade.sendNotification(ListenersModuleConstants.CLOSE_WINDOW);
					var info:Object = notification.getBody();
					info["moduleId"] = _module.moduleId;
					_endpoint.sendMessage(EndpointMessageConstants.MODULE_STOPPED, 
							EndpointMessageConstants.TO_MAIN_APP, info);
					break;
				case ListenersModuleConstants.ADD_WINDOW:
					trace(NAME + ':Sending ADD_WINDOW message to main');
					_endpoint.sendMessage(EndpointMessageConstants.ADD_WINDOW, 
							EndpointMessageConstants.TO_MAIN_APP, notification.getBody());
					break;
				case ListenersModuleConstants.REMOVE_WINDOW:
					trace(NAME + ':Sending REMOVE_WINDOW message to main');
					_endpoint.sendMessage(EndpointMessageConstants.REMOVE_WINDOW, 
							EndpointMessageConstants.TO_MAIN_APP, notification.getBody());
					break;
			}
		}
	
		private function messageReceiver(message : IPipeMessage) : void
		{
			var msg : String = message.getHeader().MSG as String;
			switch(msg){
				case EndpointMessageConstants.CLOSE_WINDOW:
					facade.sendNotification(ListenersModuleConstants.CLOSE_WINDOW);
					break;
				case EndpointMessageConstants.OPEN_WINDOW:
					//trace('Received OPEN_WINDOW message from ' + message.getHeader().SRC);
					//facade.sendNotification(ChatModuleConstants.OPEN_WINDOW);
					break;
			}
		}
		
		private function get proxy():ListenersProxy {
			return facade.retrieveProxy(ListenersProxy.NAME) as ListenersProxy;
		}				
	}
}