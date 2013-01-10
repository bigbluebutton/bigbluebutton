package org.bigbluebutton.modules.broadcast.services
{
  import com.asfusion.mate.events.Dispatcher;
  
  import org.bigbluebutton.core.BBB;
  import org.bigbluebutton.main.events.BBBEvent;
  import org.bigbluebutton.main.model.users.IMessageListener;

  public class MessageReceiver implements IMessageListener
  {
    private var dispatcher:Dispatcher;
    
    public function MessageReceiver() {
      dispatcher = new Dispatcher();
      BBB.initConnectionManager().addMessageListener(this);
    }
    
    public function onMessage(messageName:String, message:Object):void {
      trace("Broadcast: received message " + messageName);
      
      switch (messageName) {
        case "BroadcastPlayStreamCommand":
            handleBroadcastPlayStreamCommand(message);
          break;
        case "BroadcastStopStreamCommand":
            handleBroadcastStopStreamCommand(message);
          break;
        case "BroadcastWhatIsTheCurrentStreamRequest":
            handleBroadcastWhatIsTheCurrentStreamRequest(message);
          break;    
        case "BroadcastWhatIsTheCurrentStreamReply":
          handleBroadcastWhatIsTheCurrentStreamReply(message);
          break;   				
        default:
          //          LogUtil.warn("Cannot handle message [" + messageName + "]");
      }
    }
    
    private function handleBroadcastPlayStreamCommand(message:Object):void {
      var event:BBBEvent = new BBBEvent("BroadcastPlayStreamCommand");
      event.payload["messageID"] = "BroadcastPlayStreamCommand";
      event.payload["uri"] = message.uri;
      event.payload["streamID"] = message.streamID;
      event.payload["streamName"] = message.streamName;		
      
      dispatcher.dispatchEvent(event);
    }
    
    private function handleBroadcastStopStreamCommand(messsage:Object):void {
      var event:BBBEvent = new BBBEvent("BroadcastStopStreamCommand");
      event.payload["messageID"] = "BroadcastStopStreamCommand";      
      dispatcher.dispatchEvent(event);      
    }
    
    private function handleBroadcastWhatIsTheCurrentStreamRequest(message:Object):void {
      var event:BBBEvent = new BBBEvent("BroadcastWhatIsTheCurrentStreamRequest");
      event.payload["messageID"] = "BroadcastWhatIsTheCurrentStreamRequest";   
      event.payload["requestedBy"] = message.requestedByUserID;

      dispatcher.dispatchEvent(event);      
    }
    
    private function handleBroadcastWhatIsTheCurrentStreamReply(message:Object):void {
      var event:BBBEvent = new BBBEvent("BroadcastWhatIsTheCurrentStreamReply");
      event.payload["messageID"] = "BroadcastWhatIsTheCurrentStreamReply";   
      event.payload["requestedBy"] = message.requestedByUserID;
      event.payload["streamID"] = message.streamID;
      
      dispatcher.dispatchEvent(event);
    }
  }        
}