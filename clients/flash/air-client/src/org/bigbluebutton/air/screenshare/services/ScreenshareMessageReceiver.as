package org.bigbluebutton.air.screenshare.services
{
	import org.bigbluebutton.air.common.models.IMessageListener;
	import org.bigbluebutton.air.screenshare.model.IScreenshareModel;

	public class ScreenshareMessageReceiver implements IMessageListener
	{
		[Inject]
		public var model: IScreenshareModel;
		
		public function onMessage(messageName:String, message:Object):void {
			//LOGGER.debug(" Received message " + messageName);
			
			switch (messageName) {
				case "isSharingScreenRequestResponse":
					handleIsSharingScreenRequestResponse(message);
					break;
				case "screenShareStartedMessage":
					handleScreenShareStartedMessage(message);
					break;
				case "screenShareStoppedMessage":
					handleScreenShareStoppedMessage(message);
					break;  
				default:
					trace("Cannot handle message [" + messageName + "]");
			}
		}
		
		private function handleScreenShareStartedMessage(message:Object):void {
			trace("handleScreenShareStartedMessage " + message.msg);      
			var map:Object = JSON.parse(message.msg);
			if (map.hasOwnProperty("streamId") && map.hasOwnProperty("width") &&
				map.hasOwnProperty("height") && map.hasOwnProperty("url")) {
				model.screenshareStreamStarted(map.streamId, map.width, map.height, map.url);
			}
		}
		
		private function handleScreenShareStoppedMessage(message:Object):void {
			trace("handleScreenShareStoppedMessage " + message.msg);      
			var map:Object = JSON.parse(message.msg);      
			if (map.hasOwnProperty("session") && map.hasOwnProperty("reason")) {
				model.screenshareStreamStopped(map.session, map.reason);
			}
		}
		
		private function handleIsSharingScreenRequestResponse(message:Object):void {
			trace("handleIsSharingScreenRequestResponse " + message.msg);
			var map:Object = JSON.parse(message.msg);
			if (map.hasOwnProperty("sharing") && map.sharing) {
				if (map.hasOwnProperty("streamId") && map.hasOwnProperty("width") &&
					map.hasOwnProperty("height") && map.hasOwnProperty("url") && map.hasOwnProperty("session")) {
					model.screenshareStreamRunning(map.streamId, map.width, map.height, map.url, map.session);
				}
			}
		}
	}
}