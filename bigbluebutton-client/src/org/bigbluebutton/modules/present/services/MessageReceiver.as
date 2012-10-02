package org.bigbluebutton.modules.present.services
{
  import com.asfusion.mate.events.Dispatcher;
  
  import org.bigbluebutton.common.LogUtil;
  import org.bigbluebutton.core.BBB;
  import org.bigbluebutton.main.model.users.IMessageListener;
  import org.bigbluebutton.modules.present.events.CursorEvent;
  
  public class MessageReceiver implements IMessageListener
  {
    public function MessageReceiver()
    {
      BBB.initConnectionManager().addMessageListener(this);
    }
    
    public function onMessage(messageName:String, message:Object):void {
//      LogUtil.debug("Presentation: received message " + messageName);
      
      switch (messageName) {
        case "PresentationCursorUpdateCommand":
          handlePresentationCursorUpdateCommand(message);
          break;			
        default:
       //   LogUtil.warn("Cannot handle message [" + messageName + "]");
      }
    }  
    
    private function handlePresentationCursorUpdateCommand(message:Object):void {    
      var e:CursorEvent = new CursorEvent(CursorEvent.UPDATE_CURSOR);
      e.xPercent = message.xPercent;
      e.yPercent = message.yPercent;
      var dispatcher:Dispatcher = new Dispatcher();
      dispatcher.dispatchEvent(e);
    }
  }
}