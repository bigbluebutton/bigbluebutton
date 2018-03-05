package org.bigbluebutton.air.screenshare.services
{
	import org.bigbluebutton.air.common.models.IMessageListener;
	import org.bigbluebutton.air.screenshare.signals.IsSharingScreenSignal;
	
//	import org.bigbluebutton.modules.screenshare.events.IsSharingScreenEvent;
//	import org.bigbluebutton.modules.screenshare.events.ScreenShareClientPingMessage;
//	import org.bigbluebutton.modules.screenshare.events.ScreenSharePausedEvent;
//	import org.bigbluebutton.modules.screenshare.events.ShareStartRequestResponseEvent;
//	import org.bigbluebutton.modules.screenshare.events.ShareStartedEvent;
//	import org.bigbluebutton.modules.screenshare.events.ShareStoppedEvent;
//	import org.bigbluebutton.modules.screenshare.model.ScreenshareModel;

	public class ScreenshareMessageReceiver implements IMessageListener
	{
		[Inject]
		public var isSharingScreenSignal: IsSharingScreenSignal;
		
		public function onMessage(messageName:String, message:Object):void {
			//LOGGER.debug(" Received message " + messageName);
			
			switch (messageName) {
				case "isSharingScreenRequestResponse":
					handleIsSharingScreenRequestResponse(message);
					break;
				case "startShareRequestResponse":
					handleStartShareRequestResponse(message);
					break;
				case "screenShareStartedMessage":
					handleScreenShareStartedMessage(message);
					break;
				case "screenShareStoppedMessage":
					handleScreenShareStoppedMessage(message);
					break;  
				case "screenSharePausedMessage":
					handleScreenSharePausedMessage(message);
					break;
				case "startShareRequestRejectedResponse":
					handleStartShareRequestRejectedResponse(message);
					break;
				case "screenShareClientPingMessage":
					handleScreenShareClientPingMessage(message);
					break;
				default:
					trace("Cannot handle message [" + messageName + "]");
			}
		}
		
		private function handleScreenShareClientPingMessage(message:Object):void {
			//LOGGER.debug("handleScreenShareClientPingMessage " + message.msg);      
			var map:Object = JSON.parse(message.msg);      
			if (map.hasOwnProperty("meetingId") && map.hasOwnProperty("session") && map.hasOwnProperty("timestamp")) {
//				if (ScreenshareModel.getInstance().session == map.session) {
					//LOGGER.debug("handleScreenShareClientPingMessage - sending ping for session=[" + map.session + "]"); 
//					var sharePingEvent: ScreenShareClientPingMessage = new ScreenShareClientPingMessage(map.session, map.timestamp);
//					dispatcher.dispatchEvent(sharePingEvent);             
//				}
				
				
			} 
		}
		
		private function handleScreenSharePausedMessage(message:Object):void {
			trace("handleScreenSharePausedMessage " + message.msg);      
			var map:Object = JSON.parse(message.msg);      
			if (map.hasOwnProperty("meetingId") && map.hasOwnProperty("session")) {
//				var sharePausedEvent: ScreenSharePausedEvent = new ScreenSharePausedEvent(map.session);
//				dispatcher.dispatchEvent(sharePausedEvent); 
			} 
		}
		
		private function handleStartShareRequestRejectedResponse(message:Object):void {
			trace("handleStartShareRequestRejectedResponse " + message.msg);      
//			var shareFailedEvent: ShareStartRequestResponseEvent = new ShareStartRequestResponseEvent(null, null, null, false, null);
//			dispatcher.dispatchEvent(shareFailedEvent);         
		}
		
		private function handleStartShareRequestResponse(message:Object):void {
			trace("handleStartShareRequestResponse " + message.msg);      
			var map:Object = JSON.parse(message.msg);      
			if (map.hasOwnProperty("authToken") && map.hasOwnProperty("jnlp") && map.hasOwnProperty("streamId") && map.hasOwnProperty("session")) {
//				var shareSuccessEvent: ShareStartRequestResponseEvent = new ShareStartRequestResponseEvent(map.authToken, map.jnlp, map.streamId, true, map.session);
//				dispatcher.dispatchEvent(shareSuccessEvent); 
			} else {
//				var shareFailedEvent: ShareStartRequestResponseEvent = new ShareStartRequestResponseEvent(null, null, null, false, null);
//				dispatcher.dispatchEvent(shareFailedEvent);         
			}
		}
		
		private function handleScreenShareStartedMessage(message:Object):void {
			trace("handleScreenShareStartedMessage " + message.msg);      
			var map:Object = JSON.parse(message.msg);
			if (map.hasOwnProperty("streamId") && map.hasOwnProperty("width") &&
				map.hasOwnProperty("height") && map.hasOwnProperty("url")) {
//				var shareStartedEvent: ShareStartedEvent = new ShareStartedEvent(map.streamId, map.width,
//					map.height, map.url);
//				dispatcher.dispatchEvent(shareStartedEvent); 
			}
		}
		
		private function handleScreenShareStoppedMessage(message:Object):void {
			trace("handleScreenShareStoppedMessage " + message.msg);      
			var map:Object = JSON.parse(message.msg);      
			if (map.hasOwnProperty("session") && map.hasOwnProperty("reason")) {
//				if (ScreenshareModel.getInstance().session == map.session) {
//					var streamEvent: ShareStoppedEvent = new ShareStoppedEvent(map.session, map.reason);
//					dispatcher.dispatchEvent(streamEvent);   
//				}
			}
		}
		
		private function handleIsSharingScreenRequestResponse(message:Object):void {
			trace("handleIsSharingScreenRequestResponse " + message.msg);
			var map:Object = JSON.parse(message.msg);
			if (map.hasOwnProperty("sharing") && map.sharing) {
				if (map.hasOwnProperty("streamId") && map.hasOwnProperty("width") &&
					map.hasOwnProperty("height") && map.hasOwnProperty("url") && map.hasOwnProperty("session")) {
					isSharingScreenSignal.dispatch(map.streamId, map.width, map.height, map.url, map.session);
				}
			}
		}
	}
}