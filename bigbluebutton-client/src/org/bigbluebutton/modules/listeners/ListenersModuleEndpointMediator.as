package org.bigbluebutton.modules.listeners
{
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
		
		private var _module:ListenersModule;
		private var _router:Router;
		private var _endpoint:Endpoint;		
		private static const TO_LISTENERS_MODULE:String = "TO_LISTENERS_MODULE";
		private static const FROM_LISTENERS_MODULE:String = "FROM_LISTENERS_MODULE";
			
		public function ListenersModuleEndpointMediator(module:ListenersModule)
		{
			super(NAME,module);
			_module = module;
			_router = module.router
			LogUtil.debug(NAME + ":Creating endpoint for ListenersModule");
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
					LogUtil.debug(NAME + ":Sending MODULE_STARTED message to main");
					_endpoint.sendMessage(EndpointMessageConstants.MODULE_STARTED, 
							EndpointMessageConstants.TO_MAIN_APP, _module.moduleId);
					
					/**
					 * Call the server to convert the recorded audio to MP3.
					 * NOTE: THis is just a hack...need to do this properly. (ralam - march 26, 2009)
					 */
					if (_module.mode == 'PLAYBACK') {
						proxy.convertRecodingToMp3();
					}
					
					facade.sendNotification(ListenersModuleConstants.OPEN_WINDOW);
					break;
				case ListenersModuleConstants.DISCONNECTED:
					LogUtil.debug(NAME + ':Sending MODULE_STOPPED message to main');
					facade.sendNotification(ListenersModuleConstants.CLOSE_WINDOW);
//					var info:Object = notification.getBody();
//					info["moduleId"] = _module.moduleId;
//					_endpoint.sendMessage(EndpointMessageConstants.MODULE_STOPPED, 
//							EndpointMessageConstants.TO_MAIN_APP, info);
					break;
				case ListenersModuleConstants.ADD_WINDOW:
					LogUtil.debug(NAME + ':Sending ADD_WINDOW message to main');
					_endpoint.sendMessage(EndpointMessageConstants.ADD_WINDOW, 
							EndpointMessageConstants.TO_MAIN_APP, notification.getBody());
					break;
				case ListenersModuleConstants.REMOVE_WINDOW:
					LogUtil.debug(NAME + ':Sending REMOVE_WINDOW message to main');
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
					//LogUtil.debug('Received OPEN_WINDOW message from ' + message.getHeader().SRC);
					//facade.sendNotification(ChatModuleConstants.OPEN_WINDOW);
					break;
			}
		}
		
		private function get proxy():ListenersProxy {
			return facade.retrieveProxy(ListenersProxy.NAME) as ListenersProxy;
		}				
	}
}