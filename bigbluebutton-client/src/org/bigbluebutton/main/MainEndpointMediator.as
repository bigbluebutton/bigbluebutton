package org.bigbluebutton.main
{
	import org.bigbluebutton.common.messaging.Endpoint;
	import org.bigbluebutton.common.messaging.EndpointMessageConstants;
	import org.bigbluebutton.common.messaging.Router;
	import org.bigbluebutton.main.model.ModulesProxy;
	import org.puremvc.as3.multicore.interfaces.IMediator;
	import org.puremvc.as3.multicore.interfaces.INotification;
	import org.puremvc.as3.multicore.patterns.mediator.Mediator;
	import org.puremvc.as3.multicore.utilities.pipes.interfaces.IPipeMessage;
	
	public class MainEndpointMediator extends Mediator implements IMediator
	{
		public static const NAME:String = "MainEndpointMediator";

		private var _router : Router;
		private var _endpoint:Endpoint;
				
		public function MainEndpointMediator()
		{
			super(NAME);
			_router = new Router();
			_endpoint = new Endpoint(_router, EndpointMessageConstants.FROM_MAIN_APP, EndpointMessageConstants.TO_MAIN_APP, messageReceiver);		
		}
		
		public function get router():Router
		{
			return _router;
		}
		
		override public function getMediatorName():String
		{
			return NAME;
		}
		
		private function get modulesProxy():ModulesProxy {
			return facade.retrieveProxy(ModulesProxy.NAME) as ModulesProxy;
		}
		
		override public function listNotificationInterests():Array
		{
			return [
				MainApplicationConstants.MODULE_START,
				MainApplicationConstants.MODULE_STOP,
				MainApplicationConstants.OPEN_WINDOW,
				MainApplicationConstants.CLOSE_WINDOW
			];
		}
		
		override public function handleNotification(notification:INotification):void
		{
			switch(notification.getName()){
				case MainApplicationConstants.MODULE_START:
					var startModule:String = notification.getBody() as String;
					trace(NAME + "::Request to start module " + startModule);
					modulesProxy.startModule(startModule, _router);						
					break;
				case MainApplicationConstants.MODULE_STOP:
					var stopModule:String = notification.getBody() as String;
					trace(NAME + "::Request to stop module " + stopModule);
					modulesProxy.stopModule(stopModule);						
					break;				
			}
		}

		private function messageReceiver(message : IPipeMessage) : void
		{
			var msg : String = message.getHeader().MSG as String;						
			switch (msg)
			{
				case EndpointMessageConstants.USER_LOGGED_IN:
					trace(NAME + "::Got USER_LOGGED_IN from " + message.getHeader().SRC as String);
					modulesProxy.user = message.getBody();
					sendNotification(MainApplicationConstants.USER_LOGGED_IN, message.getBody());
					break;
				case EndpointMessageConstants.USER_LOGGED_OUT:
					trace(NAME + "::Got USER_LOGGED_OUT from " + message.getHeader().SRC as String);
					sendNotification(MainApplicationConstants.USER_LOGGED_OUT);
					break;
				case EndpointMessageConstants.MODULE_STARTED:
					trace(NAME + "::Got MODULE_STARTED from " + message.getBody() as String);
					modulesProxy.moduleStarted(message.getBody() as String, true);
					break;
				case EndpointMessageConstants.MODULE_STOPPED:
					trace(NAME + "::Got MODULE_STOPPED from " + message.getBody() as String);					
					var info:Object = message.getBody();
					modulesProxy.moduleStarted(info.moduleId, false);
					if ( (info.moduleId == "ChatModule") || (info.moduleId == "VideoModule") ||
							(info.moduleId == "ListenersModule") || (info.moduleId == "PresentationModule")){
						trace(info.moduleId + " has stopped [" + info.manual + "]");
						if (! info.manual)
						sendNotification(MainApplicationConstants.MODULE_STOPPED, message.getBody());
					}
					break;
				case EndpointMessageConstants.ADD_WINDOW:
					trace(NAME + "::Got ADD_WINDOW from " + message.getHeader().SRC as String);
					sendNotification(MainApplicationConstants.ADD_WINDOW_MSG, message.getBody());
					break;
				case EndpointMessageConstants.ADD_BUTTON:
					trace(NAME + "::Got ADD_BUTTON from " + message.getHeader().SRC as String);
					sendNotification(MainApplicationConstants.ADD_BUTTON, message.getBody());
					break;
				case EndpointMessageConstants.REMOVE_WINDOW:
					trace(NAME + "::Got REMOVE_WINDOW from " + message.getHeader().SRC as String);
					sendNotification(MainApplicationConstants.REMOVE_WINDOW_MSG, message.getBody());
					break;		
				case EndpointMessageConstants.ASSIGN_PRESENTER:
					trace(NAME + "::Got ASSIGN_PRESENTER from " + message.getHeader().SRC as String);
					_endpoint.sendMessage(EndpointMessageConstants.ASSIGN_PRESENTER, 
							EndpointMessageConstants.TO_PRESENTATION_MODULE, message.getBody());
					break;			
				case EndpointMessageConstants.BECOME_VIEWER:
					trace(NAME + "::Got BECOME_VIEWER from " + message.getHeader().SRC as String);
					_endpoint.sendMessage(EndpointMessageConstants.BECOME_VIEWER, 
							EndpointMessageConstants.TO_PRESENTATION_MODULE, message.getBody());
					break;
			}
		}	
	}
}