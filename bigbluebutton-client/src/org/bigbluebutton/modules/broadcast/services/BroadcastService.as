package org.bigbluebutton.modules.broadcast.services
{
	import org.bigbluebutton.core.BBB;
	import org.bigbluebutton.core.managers.UserManager;

	public class BroadcastService {	
    private var sender:MessageSender;
    private var receiver:MessageReceiver;
    
    public function BroadcastService() {
      sender = new MessageSender();
      receiver = new MessageReceiver();
    }
    
		public function playStream(uri:String, streamID:String, streamName:String):void {
      trace("BroadcastService::playStream"); 
      if (sender == null) {
        trace("SENDER is NULL!!!!");
      }
      sender.playStream(uri, streamID, streamName);
		}
		
		public function stopStream():void {
      trace("BroadcastService::stopStream"); 
			sender.stopStream();
		}
		
		public function sendWhatIsTheCurrentStreamRequest():void {
			sender.sendWhatIsTheCurrentStreamRequest();
		}
		
		public function sendWhatIsTheCurrentStreamReply(requestedByUserID:Number, streamID:String):void {
			sender.sendWhatIsTheCurrentStreamReply(requestedByUserID, streamID);
		}
	}
}