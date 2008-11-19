package org.bigbluebutton.modules.viewers
{
	import org.bigbluebutton.common.IBigBlueButtonModule;
	import org.bigbluebutton.common.messaging.Endpoint;
	import org.bigbluebutton.common.messaging.EndpointMessageConstants;
	import org.bigbluebutton.common.messaging.Router;
	import org.bigbluebutton.modules.viewers.model.ViewersProxy;
	import org.puremvc.as3.multicore.interfaces.IMediator;
	import org.puremvc.as3.multicore.interfaces.INotification;
	import org.puremvc.as3.multicore.patterns.mediator.Mediator;
	import org.puremvc.as3.multicore.utilities.pipes.interfaces.IPipeMessage;

	public class ViewersEndpointMediator extends Mediator implements IMediator
	{
		public static const NAME:String = "ViewersEndpointMediator";
		
		private var _module:IBigBlueButtonModule;
		private var _router:Router;
		private var _endpoint:Endpoint;		
		private static const TO_VIEWERS_MODULE:String = "TO_VIEWERS_MODULE";
		private static const FROM_VIEWERS_MODULE:String = "FROM_VIEWERS_MODULE";
		
		private static const PLAYBACK_MESSAGE:String = "PLAYBACK_MESSAGE";
		private static const PLAYBACK_MODE:String = "PLAYBACK_MODE";
				
		public function ViewersEndpointMediator(module:IBigBlueButtonModule)
		{
			super(NAME,module);
			_module = module;
			_router = module.router
			trace("Creating endpoint for ViewersModule");
			_endpoint = new Endpoint(_router, FROM_VIEWERS_MODULE, TO_VIEWERS_MODULE, messageReceiver);	
		}
		
		override public function getMediatorName():String
		{
			return NAME;
		}
				
		override public function listNotificationInterests():Array
		{
			return [
				ViewersModuleConstants.LOGGED_OUT,
				ViewersModuleConstants.LOGGED_IN,
				ViewersModuleConstants.STARTED,
				ViewersModuleConstants.CONNECTED,
				ViewersModuleConstants.DISCONNECTED,
				ViewersModuleConstants.ADD_WINDOW,
				ViewersModuleConstants.REMOVE_WINDOW,
				ViewersModuleConstants.ASSIGN_PRESENTER,
				ViewersModuleConstants.BECOME_VIEWER
			];
		}
		
		override public function handleNotification(notification:INotification):void
		{
			switch(notification.getName()){
				case ViewersModuleConstants.LOGGED_OUT:
					_endpoint.sendMessage(EndpointMessageConstants.USER_LOGGED_OUT,
							EndpointMessageConstants.TO_MAIN_APP, "LOGGED_OUT"); // just send a string
					break;
				case ViewersModuleConstants.LOGGED_IN:
					var user:Object = {userid:proxy.me.userid, username:proxy.me.name, 
										userrole:proxy.me.role, room:proxy.me.room, authToken:proxy.me.authToken};					
					_endpoint.sendMessage(EndpointMessageConstants.USER_LOGGED_IN,
							EndpointMessageConstants.TO_MAIN_APP, user);
					break;
				case ViewersModuleConstants.STARTED:
					trace("Sending Viewers MODULE_STARTED message to main");
					_endpoint.sendMessage(EndpointMessageConstants.MODULE_STARTED, 
							EndpointMessageConstants.TO_MAIN_APP, _module.moduleId);
					facade.sendNotification(ViewersModuleConstants.OPEN_JOIN_WINDOW);
					break;
				case ViewersModuleConstants.DISCONNECTED:
					trace('Sending Viewers MODULE_STOPPED message to main');
					_endpoint.sendMessage(EndpointMessageConstants.MODULE_STOPPED, 
							EndpointMessageConstants.TO_MAIN_APP, _module.moduleId);
					break;
				case ViewersModuleConstants.ADD_WINDOW:
					trace('Sending Viewers ADD_WINDOW message to main');
					_endpoint.sendMessage(EndpointMessageConstants.ADD_WINDOW, 
							EndpointMessageConstants.TO_MAIN_APP, notification.getBody());
					break;
				case ViewersModuleConstants.REMOVE_WINDOW:
					trace('Sending Viewers REMOVE_WINDOW message to main');
					_endpoint.sendMessage(EndpointMessageConstants.REMOVE_WINDOW, 
							EndpointMessageConstants.TO_MAIN_APP, notification.getBody());
					break;
				case ViewersModuleConstants.ASSIGN_PRESENTER:
					trace('Sending ASSIGN_PRESENTER to main');
					_endpoint.sendMessage(EndpointMessageConstants.ASSIGN_PRESENTER, 
							EndpointMessageConstants.TO_MAIN_APP, notification.getBody());
					break;
				case ViewersModuleConstants.BECOME_VIEWER:
					trace('Sending BECOME_VIEWER to main');
					_endpoint.sendMessage(EndpointMessageConstants.BECOME_VIEWER, 
							EndpointMessageConstants.TO_MAIN_APP, notification.getBody());
					break;
			}
		}
	
		private function messageReceiver(message : IPipeMessage) : void
		{
			var msg : String = message.getHeader().MSG as String;
			switch(msg){
				case EndpointMessageConstants.CLOSE_WINDOW:
					facade.sendNotification(ViewersModuleConstants.CLOSE_WINDOW);
					break;
				case EndpointMessageConstants.OPEN_WINDOW:
					//trace('Received OPEN_WINDOW message from ' + message.getHeader().SRC);
					//facade.sendNotification(ChatModuleConstants.OPEN_WINDOW);
					break;
				case EndpointMessageConstants.ASSIGN_PRESENTER:
					trace('Received OPEN_WINDOW message from ' + message.getHeader().SRC);
					//facade.sendNotification(ChatModuleConstants.OPEN_WINDOW);
					break;
				case EndpointMessageConstants.STARTED_BROADCAST:
					trace('Received STARTED_BROADCAST message from ' + message.getHeader().SRC);
					trace('Sending add stream ' + message.getBody().streamName);
					proxy.addStream(message.getBody().userid, message.getBody().streamName);
					break;
				case EndpointMessageConstants.STOPPED_BROADCAST:
					trace('Received STOPPED_BROADCAST message from ' + message.getHeader().SRC);
					trace('Sending remove stream ' + message.getBody().streamName);
					proxy.removeStream(message.getBody().userid, message.getBody().streamName);
					break;
				
			}
		}
		
		private function get proxy():ViewersProxy {
			return facade.retrieveProxy(ViewersProxy.NAME) as ViewersProxy;
		}				
	}
}