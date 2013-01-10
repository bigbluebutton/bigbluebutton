package org.bigbluebutton.modules.broadcast.services
{
	import com.asfusion.mate.events.Dispatcher;
	
	import org.bigbluebutton.core.BBB;
	import org.bigbluebutton.core.managers.UserManager;
	import org.bigbluebutton.main.events.BBBEvent;

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
//      sender.playStream(uri, streamID, streamName);
      
      var event:BBBEvent = new BBBEvent("BroadcastPlayStreamCommand");
      event.payload["messageID"] = "BroadcastPlayStreamCommand";
      event.payload["uri"] = uri;
      event.payload["streamID"] = streamID;
      event.payload["streamName"] = streamName;		
      
      var dispatcher:Dispatcher = new Dispatcher();
      dispatcher.dispatchEvent(event);
      
		}
		
		public function stopStream():void {
      trace("BroadcastService::stopStream"); 
//			sender.stopStream();
      
      var event:BBBEvent = new BBBEvent("BroadcastStopStreamCommand");
      event.payload["messageID"] = "BroadcastStopStreamCommand";    
      
      var dispatcher:Dispatcher = new Dispatcher();
      dispatcher.dispatchEvent(event);     
		}
		
		public function sendWhatIsTheCurrentStreamRequest():void {
			sender.sendWhatIsTheCurrentStreamRequest();
		}
		
		public function sendWhatIsTheCurrentStreamReply(requestedByUserID:Number, streamID:String):void {
			sender.sendWhatIsTheCurrentStreamReply(requestedByUserID, streamID);
		}
	}
}