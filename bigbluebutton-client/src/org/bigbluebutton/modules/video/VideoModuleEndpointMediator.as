package org.bigbluebutton.modules.video
{
	import org.bigbluebutton.common.IBigBlueButtonModule;
	import org.bigbluebutton.common.messaging.Endpoint;
	import org.bigbluebutton.common.messaging.EndpointMessageConstants;
	import org.bigbluebutton.common.messaging.Router;
	import org.puremvc.as3.multicore.interfaces.IMediator;
	import org.puremvc.as3.multicore.interfaces.INotification;
	import org.puremvc.as3.multicore.patterns.mediator.Mediator;
	import org.puremvc.as3.multicore.utilities.pipes.interfaces.IPipeMessage;

	public class VideoModuleEndpointMediator extends Mediator implements IMediator
	{
		public static const NAME:String = "ChatEndPointMediator";
		
		private var _module:IBigBlueButtonModule;
		private var _router:Router;
		private var _endpoint:Endpoint;		
		private static const TO_VIDEO_MODULE:String = "TO_VIDEO_MODULE";
		private static const FROM_VIDEO_MODULE:String = "FROM_VIDEO_MODULE";
		
		public function VideoModuleEndpointMediator(module:IBigBlueButtonModule)
		{
			super(NAME,module);
			_module = module;
			_router = module.router
			trace("Creating endpoint for VideoModule");
			_endpoint = new Endpoint(_router, FROM_VIDEO_MODULE, TO_VIDEO_MODULE, messageReceiver);	
		}
		
		override public function getMediatorName():String
		{
			return NAME;
		}
				
		override public function listNotificationInterests():Array
		{
			return [
				VideoModuleConstants.CONNECTED,
				VideoModuleConstants.DISCONNECTED,
				VideoModuleConstants.STARTED_BROADCAST,
				VideoModuleConstants.STOPPED_BROADCAST,
				VideoModuleConstants.ADD_WINDOW,
				VideoModuleConstants.REMOVE_WINDOW,
				VideoModuleConstants.ADD_BUTTON
			];
		}
		
		override public function handleNotification(notification:INotification):void
		{
			switch(notification.getName()){
				case VideoModuleConstants.CONNECTED:
					trace("Sending Video MODULE_STARTED message to main");
					_endpoint.sendMessage(EndpointMessageConstants.MODULE_STARTED, 
							EndpointMessageConstants.TO_MAIN_APP, _module.moduleId);
					break;
				case VideoModuleConstants.DISCONNECTED:
					trace('Sending Video MODULE_STOPPED message to main');
					_endpoint.sendMessage(EndpointMessageConstants.MODULE_STOPPED, 
							EndpointMessageConstants.TO_MAIN_APP, _module.moduleId);
					break;
				case VideoModuleConstants.ADD_WINDOW:
					trace('Sending Video ADD_WINDOW message to main');
					_endpoint.sendMessage(EndpointMessageConstants.ADD_WINDOW, 
							EndpointMessageConstants.TO_MAIN_APP, notification.getBody());
					break;
				case VideoModuleConstants.REMOVE_WINDOW:
					trace('Sending Video REMOVE_WINDOW message to main');
					_endpoint.sendMessage(EndpointMessageConstants.REMOVE_WINDOW, 
							EndpointMessageConstants.TO_MAIN_APP, notification.getBody());
					break;
				case VideoModuleConstants.ADD_BUTTON:
					trace('Sending Video ADD_BUTTON message to main');
					_endpoint.sendMessage(EndpointMessageConstants.ADD_BUTTON, 
							EndpointMessageConstants.TO_MAIN_APP, notification.getBody());
					break;
				case VideoModuleConstants.STARTED_BROADCAST:
					trace('Sending Video STARTED_BROADCAST message to ViewersModule' + notification.getBody() as String);
					_endpoint.sendMessage(EndpointMessageConstants.STARTED_BROADCAST, 
							EndpointMessageConstants.TO_VIEWERS_MODULE, 
							{userid:_module.userid, streamName:notification.getBody() as String});
					break;
				case VideoModuleConstants.STOPPED_BROADCAST:
					trace('Sending Video STOPPED_BROADCAST message to ViewersModule ' + notification.getBody() as String);
					_endpoint.sendMessage(EndpointMessageConstants.STOPPED_BROADCAST, 
							EndpointMessageConstants.TO_VIEWERS_MODULE, 
							{userid:_module.userid, streamName:notification.getBody() as String});
					break;
			}
		}
	
		private function messageReceiver(message : IPipeMessage) : void
		{
			var msg : String = message.getHeader().MSG as String;
			switch(msg){
				case EndpointMessageConstants.CLOSE_WINDOW:
					facade.sendNotification(VideoModuleConstants.CLOSE_WINDOW);
					break;
				case EndpointMessageConstants.OPEN_WINDOW:
					//trace('Received OPEN_WINDOW message from ' + message.getHeader().SRC);
					//facade.sendNotification(ChatModuleConstants.OPEN_WINDOW);
					break;
				case EndpointMessageConstants.VIEW_CAMERA:
					trace('Received VIEW_CAMERA message from ' + message.getHeader().SRC);
					//facade.sendNotification(ChatModuleConstants.OPEN_WINDOW);
					break;
			}
		}
		
		private function playMessage(message:XML):void{

		}				
	}
}