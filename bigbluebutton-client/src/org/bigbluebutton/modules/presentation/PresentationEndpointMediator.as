package org.bigbluebutton.modules.presentation
{
	import org.bigbluebutton.common.IBigBlueButtonModule;
	import org.bigbluebutton.common.messaging.Endpoint;
	import org.bigbluebutton.common.messaging.EndpointMessageConstants;
	import org.bigbluebutton.common.messaging.Router;
	import org.bigbluebutton.modules.presentation.model.business.PresentProxy;
	import org.puremvc.as3.multicore.interfaces.IMediator;
	import org.puremvc.as3.multicore.interfaces.INotification;
	import org.puremvc.as3.multicore.patterns.mediator.Mediator;
	import org.puremvc.as3.multicore.utilities.pipes.interfaces.IPipeMessage;

	public class PresentationEndpointMediator extends Mediator implements IMediator
	{
		public static const NAME:String = "PresentationEndpointMediator";
		
		private var _module:IBigBlueButtonModule;
		private var _router:Router;
		private var _endpoint:Endpoint;		
		private static const TO_PRESENTATION_MODULE:String = "TO_PRESENTATION_MODULE";
		private static const FROM_PRESENTATION_MODULE:String = "FROM_PRESENTATION_MODULE";
		
		private static const PLAYBACK_MESSAGE:String = "PLAYBACK_MESSAGE";
		private static const PLAYBACK_MODE:String = "PLAYBACK_MODE";
				
		public function PresentationEndpointMediator(module:IBigBlueButtonModule)
		{
			super(NAME,module);
			_module = module;
			_router = module.router
			LogUtil.debug("Creating endpoint for PresentationModule");
			_endpoint = new Endpoint(_router, FROM_PRESENTATION_MODULE, TO_PRESENTATION_MODULE, messageReceiver);	
		}
		
		override public function getMediatorName():String
		{
			return NAME;
		}
				
		override public function listNotificationInterests():Array
		{
			return [
				PresentModuleConstants.STARTED,
				PresentModuleConstants.CONNECTED,
				PresentModuleConstants.DISCONNECTED,
				PresentModuleConstants.ADD_WINDOW,
				PresentModuleConstants.REMOVE_WINDOW
			];
		}
		
		override public function handleNotification(notification:INotification):void
		{
			switch(notification.getName()){
				case PresentModuleConstants.STARTED:
					presentProxy.connect();
					LogUtil.debug("Sending Present MODULE_STARTED message to main");
					_endpoint.sendMessage(EndpointMessageConstants.MODULE_STARTED, 
							EndpointMessageConstants.TO_MAIN_APP, _module.moduleId);
					facade.sendNotification(PresentModuleConstants.OPEN_PRESENT_WINDOW);
					break;
				case PresentModuleConstants.DISCONNECTED:
					LogUtil.debug('Sending Present MODULE_STOPPED message to main');
					facade.sendNotification(PresentModuleConstants.REMOVE_UPLOAD_WINDOW);
					facade.sendNotification(PresentModuleConstants.THUMBNAIL_WINDOW_CLOSE);
					facade.sendNotification(PresentModuleConstants.CLOSE_PRESENT_WINDOW);
					var info:Object = notification.getBody();
					info["moduleId"] = _module.moduleId;
					_endpoint.sendMessage(EndpointMessageConstants.MODULE_STOPPED, 
							EndpointMessageConstants.TO_MAIN_APP, info);
					break;
				case PresentModuleConstants.ADD_WINDOW:
					LogUtil.debug('Sending Present ADD_WINDOW message to main');
					_endpoint.sendMessage(EndpointMessageConstants.ADD_WINDOW, 
							EndpointMessageConstants.TO_MAIN_APP, notification.getBody());
					break;
				case PresentModuleConstants.REMOVE_WINDOW:
					LogUtil.debug('Sending Present REMOVE_WINDOW message to main');
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
					facade.sendNotification(PresentModuleConstants.CLOSE_WINDOW);
					break;
				case EndpointMessageConstants.OPEN_WINDOW:
					//LogUtil.debug('Received OPEN_WINDOW message from ' + message.getHeader().SRC);
					//facade.sendNotification(ChatModuleConstants.OPEN_WINDOW);
					break;
				case EndpointMessageConstants.ASSIGN_PRESENTER:
					LogUtil.debug('Received ASSIGN_PRESENTER message from ' + message.getHeader().SRC);
					var p:Object = message.getBody();
					presentProxy.assignPresenter(p["assignTo"], p["name"]);
					break;
				case EndpointMessageConstants.BECOME_VIEWER:
					LogUtil.debug('Received BECOME_VIEWER message from ' + message.getHeader().SRC);
					//facade.sendNotification(PresentModuleConstants.VIEWER_MODE);
					break;
			}
		}
		
		private function get presentProxy():PresentProxy {
			return facade.retrieveProxy(PresentProxy.NAME) as PresentProxy;
		}	
	}
}