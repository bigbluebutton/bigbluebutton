package org.bigbluebutton.modules.whiteboard
{
	import org.bigbluebutton.common.IBigBlueButtonModule;
	import org.bigbluebutton.common.messaging.Endpoint;
	import org.bigbluebutton.common.messaging.EndpointMessageConstants;
	import org.bigbluebutton.common.messaging.Router;
	import org.puremvc.as3.multicore.interfaces.IMediator;
	import org.puremvc.as3.multicore.interfaces.INotification;
	import org.puremvc.as3.multicore.patterns.mediator.Mediator;
	import org.puremvc.as3.multicore.utilities.pipes.interfaces.IPipeMessage;
	
	public class WhiteboardEndpointMediator extends Mediator implements IMediator
	{
		public static const NAME:String = "WhiteboardEndpointMediator";
		
		private var _module:IBigBlueButtonModule;
		private var _router:Router;
		private var _endpoint:Endpoint;		
		
		private static const TO_WHITEBOARD_MODULE:String = "TO_WHITEBOARD_MODULE";
		private static const FROM_WHITEBOARD_MODULE:String = "FROM_WHITEBOARD_MODULE";
		
		public function WhiteboardEndpointMediator(module:IBigBlueButtonModule)
		{
			super(NAME, module);
			_module = module;
			_router = module.router;
			LogUtil.debug("Creating endpoint for WhiteboardModule");
			_endpoint = new Endpoint(_router, FROM_WHITEBOARD_MODULE, TO_WHITEBOARD_MODULE, messageReceiver);	
		}
		
		override public function getMediatorName():String{
			return NAME;
		}
		
		override public function listNotificationInterests():Array{
			return [
					WhiteboardModuleConstants.CONNECTED,
					WhiteboardModuleConstants.DISCONNECTED,
					WhiteboardModuleConstants.ADD_WINDOW,
					WhiteboardModuleConstants.REMOVE_WINDOW
					];
		}
		
		override public function handleNotification(notification:INotification):void{
			LogUtil.debug("WhiteboardEndPoint MSG. " + notification.getName());	
			switch(notification.getName()){
				case WhiteboardModuleConstants.CONNECTED:
					LogUtil.debug("Sending Whiteboard MODULE_STARTED message to main");
					_endpoint.sendMessage(EndpointMessageConstants.MODULE_STARTED, 
							EndpointMessageConstants.TO_MAIN_APP, _module.moduleId);
					facade.sendNotification(WhiteboardModuleConstants.OPEN_WINDOW);
					break;
				case WhiteboardModuleConstants.DISCONNECTED:
					LogUtil.debug('Sending Whiteboard MODULE_STOPPED message to main');
					facade.sendNotification(WhiteboardModuleConstants.CLOSE_WINDOW);
					var info:Object = notification.getBody();
					info["moduleId"] = _module.moduleId
					_endpoint.sendMessage(EndpointMessageConstants.MODULE_STOPPED, 
							EndpointMessageConstants.TO_MAIN_APP, info);
					break;
				case WhiteboardModuleConstants.ADD_WINDOW:
					LogUtil.debug('Sending Whiteboard ADD_WINDOW message to main');
					_endpoint.sendMessage(EndpointMessageConstants.ADD_WINDOW, 
							EndpointMessageConstants.TO_MAIN_APP, notification.getBody());
					break;
				case WhiteboardModuleConstants.REMOVE_WINDOW:
					LogUtil.debug('Sending Whiteboard REMOVE_WINDOW message to main');
					_endpoint.sendMessage(EndpointMessageConstants.REMOVE_WINDOW, 
							EndpointMessageConstants.TO_MAIN_APP, notification.getBody());
					break;
			}
		}
		
		private function messageReceiver(message:IPipeMessage):void{
			var msg : String = message.getHeader().MSG as String;
			switch(msg){
				case EndpointMessageConstants.CLOSE_WINDOW:
					facade.sendNotification(WhiteboardModuleConstants.CLOSE_WINDOW);
					break;
				case EndpointMessageConstants.OPEN_WINDOW:
					break;
			}
		}
		
		private function playMessage(message:XML):void{
			
		}

	}
}