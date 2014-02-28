package org.bigbluebutton.modules.present.services
{
  import com.asfusion.mate.events.Dispatcher;
  
  import mx.collections.ArrayCollection;
  
  import org.bigbluebutton.modules.present.events.CursorEvent;
  import org.bigbluebutton.modules.present.events.PageChangedEvent;
  import org.bigbluebutton.modules.present.events.PageMovedEvent;
  import org.bigbluebutton.modules.present.events.PresentationChangedEvent;
  import org.bigbluebutton.modules.present.model.Page;
  import org.bigbluebutton.modules.present.model.Presentation;
  import org.bigbluebutton.modules.present.model.PresentationModel;
  import org.bigbluebutton.modules.present.services.messages.CursorMovedMessage;
  import org.bigbluebutton.modules.present.services.messages.PageVO;
  import org.bigbluebutton.modules.present.services.messages.PresentationVO;
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
    
    public function pageChanged(page: PageVO):void {
      var np: Page = model.getPage(page.id);
      if (np != null) {
        np.current = page.current;
        np.xOffset = page.xOffset;
        np.yOffset = page.yOffset;
        np.widthRatio = page.widthRatio;
        np.heightRatio = page.heightRatio;
          
        var event: PageChangedEvent = new PageChangedEvent(np.id);
        dispatcher.dispatchEvent(event);           
      }
       
    }
        
    private function copyPageVOToPage(p: PageVO):Page {
      var page:Page = new Page(p.id, p.num, p.current,
                               p.swfUri, p.thumbUri, p.txtUri,
                               p.pngUri, p.xOffset, p.yOffset,
                               p.widthRatio, p.heightRatio);      
      return page;      
    }
    
    public function changePresentation(pres: PresentationVO):void {
      var presoPages:ArrayCollection = new ArrayCollection();
      var pages:ArrayCollection = pres.getPages() as ArrayCollection;
      for (var k:int = 0; k < pages.length; k++) {
        var page:PageVO = pages[k] as PageVO;
        var pg:Page = copyPageVOToPage(page)
        presoPages.addItem(pg);
      }   
      
      var presentation: Presentation = new Presentation(pres.id, pres.name, pres.isCurrent(), presoPages);
      
      model.addPresentation(presentation);
      
      var event: PresentationChangedEvent = new PresentationChangedEvent(presentation.id);
      dispatcher.dispatchEvent(event);
      
    }
  }
}