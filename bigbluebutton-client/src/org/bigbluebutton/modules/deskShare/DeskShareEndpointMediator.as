package org.bigbluebutton.modules.deskShare
{
	import org.bigbluebutton.common.IBigBlueButtonModule;
	import org.bigbluebutton.common.messaging.Endpoint;
	import org.bigbluebutton.common.messaging.EndpointMessageConstants;
	import org.bigbluebutton.common.messaging.Router;
	import org.puremvc.as3.multicore.interfaces.IMediator;
	import org.puremvc.as3.multicore.interfaces.INotification;
	import org.puremvc.as3.multicore.patterns.mediator.Mediator;
	import org.puremvc.as3.multicore.utilities.pipes.interfaces.IPipeMessage;
	
	/**
	 * This is the EndpointMediator for the DeskShareModule 
	 * @author Snap
	 * 
	 */	
	public class DeskShareEndpointMediator extends Mediator implements IMediator
	{
		public static const NAME:String = "DeskShareEndpointMediator";
		
		private var _module:IBigBlueButtonModule;
		private var _router:Router;
		private var _endpoint:Endpoint;
		
		private static const TO_DESK_SHARE_MODULE:String = "TO_DESK_SHARE_MODULE";
		private static const FROM_DESK_SHARE_MODULE:String = "FROM_DESK_SHARE_MODULE";
		
		private static const PLAYBACK_MESSAGE:String = "PLAYBACK_MESSAGE";
		private static const PLAYBACK_MODE:String = "PLAYBACK_MODE";
		
		/**
		 * The constructor 
		 * @param module - The DeskShareModule which this class is serving as EndpointMediator for
		 * 
		 */		
		public function DeskShareEndpointMediator(module:IBigBlueButtonModule)
		{
			super(NAME, module);
			_module = module;
			_router = module.router;
			LogUtil.debug("creating endpoint for DeskShare module");
			_endpoint = new Endpoint(_router, FROM_DESK_SHARE_MODULE, TO_DESK_SHARE_MODULE, messageReceiver);
		}
		
		override public function getMediatorName():String{
			return NAME;
		}
		
		/**
		 * Lists the notifications to which this class listens to 
		 * @return 
		 * 
		 */		
		override public function listNotificationInterests():Array{
			return [
					DeskShareModuleConstants.ADD_WINDOW,
					DeskShareModuleConstants.REMOVE_WINDOW,
					DeskShareModuleConstants.CONNECTED,
					DeskShareModuleConstants.DISCONNECTED
					];
		}
		
		/**
		 * Handles relevant notifications as they are received 
		 * @param notification
		 * 
		 */		
		override public function handleNotification(notification:INotification):void{
			LogUtil.debug("DeskShareEndpoint MSG. " + notification.getName());
			switch(notification.getName()){
				case DeskShareModuleConstants.ADD_WINDOW:
					LogUtil.debug("sending DeskShare OPEN_WINDOW message to main");
					_endpoint.sendMessage(EndpointMessageConstants.ADD_WINDOW, EndpointMessageConstants.TO_MAIN_APP, notification.getBody());
					break;
				case DeskShareModuleConstants.REMOVE_WINDOW:
					LogUtil.debug("sending DeskShare CLOSE_WINDOW message to main");
					_endpoint.sendMessage(EndpointMessageConstants.REMOVE_WINDOW, EndpointMessageConstants.TO_MAIN_APP, notification.getBody());
					break;
				case DeskShareModuleConstants.CONNECTED:
					LogUtil.debug("sending DeskShare MODULE_STARTED message to main");
					_endpoint.sendMessage(EndpointMessageConstants.MODULE_STARTED, EndpointMessageConstants.TO_MAIN_APP, _module.moduleId);
					facade.sendNotification(DeskShareModuleConstants.OPEN_WINDOW);
					break;
				case DeskShareModuleConstants.DISCONNECTED:
					LogUtil.debug("sending DeskShare MODULE_STOPPER message to main");
					facade.sendNotification(DeskShareModuleConstants.CLOSE_WINDOW);
					var info:Object = new Object();
					info["moduleId"] = _module.moduleId;
					_endpoint.sendMessage(EndpointMessageConstants.MODULE_STOPPED, EndpointMessageConstants.TO_MAIN_APP, info);
					break;
			}
		}
		
		/**
		 * Called when a message is received from somewhere outside the DeskShareModule 
		 * @param message
		 * 
		 */		
		private function messageReceiver(message:IPipeMessage):void{
			var msg:String = message.getHeader().MSG as String;
			switch(msg){
				case EndpointMessageConstants.OPEN_WINDOW:
					break;
				case EndpointMessageConstants.CLOSE_WINDOW:
					facade.sendNotification(DeskShareModuleConstants.CLOSE_WINDOW);
					break;
			}
		}
		
		/**
		 * A method for playing back messages in Playback Mode
		 * @not implemented 
		 * @param message
		 * 
		 */		
		private function playMessage(message:XML):void{
			
		}

	}
}