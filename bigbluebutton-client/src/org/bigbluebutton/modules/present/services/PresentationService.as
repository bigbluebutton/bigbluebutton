package org.bigbluebutton.modules.present.services
{
  import com.asfusion.mate.events.Dispatcher;
  
  import org.bigbluebutton.modules.present.events.CursorEvent;
  import org.bigbluebutton.modules.present.events.PageChangedEvent;
  import org.bigbluebutton.modules.present.events.PageMovedEvent;
  import org.bigbluebutton.modules.present.model.Page;
  import org.bigbluebutton.modules.present.model.PresentationModel;
  import org.bigbluebutton.modules.present.services.messages.CursorMovedMessage;
  import org.bigbluebutton.modules.present.services.messaging.MessageReceiver;
  import org.bigbluebutton.modules.present.services.messaging.MessageSender;

  public class PresentationService
  {
    private var model:PresentationModel;
    private var sender:MessageSender;
    private var receiver:MessageReceiver;
    private var dispatcher:Dispatcher;
    
    public function PresentationService() {
      model = PresentationModel.getInstance();
      receiver = new MessageReceiver(this);
      dispatcher = new Dispatcher();
    }
    
    public function cursorMoved(x: Number, y: Number):void {
      var e:CursorEvent = new CursorEvent(CursorEvent.UPDATE_CURSOR);
      e.xPercent = x;
      e.yPercent = y;
      dispatcher.dispatchEvent(e);
    }
    
    public function changeCurrentPage(pageId: String):void {
      if (model.changeCurrentPage(pageId)) {
        var event: PageChangedEvent = new PageChangedEvent(pageId);
        dispatcher.dispatchEvent(event);
      } 
    }
    
    public function movePage(id: String, xOffset: Number, yOffset: Number, widthRatio: Number, heightRatio: Number) {
      if (model.movePage(id, xOffset, yOffset, widthRatio, heightRatio) {
        var event: PageMovedEvent = new PageMovedEvent(id, xOffset, yOffset, widthRatio, heightRatio);
        dispatcher.dispatchEvent(event);
      }        
    }
    
  }
}