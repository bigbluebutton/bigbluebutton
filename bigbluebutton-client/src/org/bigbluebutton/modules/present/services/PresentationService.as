package org.bigbluebutton.modules.present.services
{
  import com.asfusion.mate.events.Dispatcher;
  
  import mx.collections.ArrayCollection;
  
  import org.bigbluebutton.modules.present.commands.ChangePageCommand;
  import org.bigbluebutton.modules.present.events.CursorEvent;
  import org.bigbluebutton.modules.present.events.PageChangedEvent;
  import org.bigbluebutton.modules.present.events.PageMovedEvent;
  import org.bigbluebutton.modules.present.events.PresentationChangedEvent;
  import org.bigbluebutton.modules.present.events.RemovePresentationEvent;
  import org.bigbluebutton.modules.present.events.UploadEvent;
  import org.bigbluebutton.modules.present.model.Page;
  import org.bigbluebutton.modules.present.model.Presentation;
  import org.bigbluebutton.modules.present.model.PresentationModel;
  import org.bigbluebutton.modules.present.services.messages.CursorMovedMessage;
  import org.bigbluebutton.modules.present.services.messages.PageVO;
  import org.bigbluebutton.modules.present.services.messages.PresentationVO;
  import org.bigbluebutton.modules.present.services.messaging.MessageReceiver;
  import org.bigbluebutton.modules.present.services.messaging.MessageSender;
  import org.bigbluebutton.modules.whiteboard.events.GetCurrentPresentationInfo;

  public class PresentationService
  {
    private static const LOG:String = "Present::PresentationService - ";
    private static const NUM_PRELOAD:uint = 3;
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
        var oldPage: Page = PresentationModel.getInstance().getCurrentPage();
        if (oldPage != null) oldPage.current = false;
        
        np.current = page.current;
        np.xOffset = page.xOffset;
        np.yOffset = page.yOffset;
        np.widthRatio = page.widthRatio;
        np.heightRatio = page.heightRatio;
//        trace(LOG + "Sending page changed event. page [" + np.id + "] oldpage current=[" + oldPage.current + "] newPage current=[" + np.current + "]");  
        var changePageCommand: ChangePageCommand = new ChangePageCommand(np.id, NUM_PRELOAD);
        dispatcher.dispatchEvent(changePageCommand);          
      }       
    }
    
    public function pageMoved(page: PageVO):void {
      var np: Page = model.getPage(page.id);
      if (np != null) {
        np.current = page.current;
        np.xOffset = page.xOffset;
        np.yOffset = page.yOffset;
        np.widthRatio = page.widthRatio;
        np.heightRatio = page.heightRatio;
//        trace(LOG + "Sending page moved event. page [" + np.id + "] current=[" + np.current + "]");
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
    
    public function addPresentations(presos:ArrayCollection):void {
      for (var i:int = 0; i < presos.length; i++) {
        var pres:PresentationVO = presos.getItemAt(i) as PresentationVO;
        addPresentation(pres);
      }
    }
    
    public function addPresentation(pres:PresentationVO):void {
      var presentation:Presentation = presentationVOToPresentation(pres);
      model.addPresentation(presentation);    
      trace(LOG + "Added new presentation [" + presentation.id + "]");
      
      if (presentation.current) {
        trace(LOG + "Making presentation [" + presentation.id +"] current [" + presentation.current + "]"); 
        var event: PresentationChangedEvent = new PresentationChangedEvent(pres.id);
        dispatcher.dispatchEvent(event);
        
        var curPage:Page = PresentationModel.getInstance().getCurrentPage();
        if (curPage != null) {
          var changePageCommand: ChangePageCommand = new ChangePageCommand(curPage.id, NUM_PRELOAD);
          dispatcher.dispatchEvent(changePageCommand);          
          
          trace(LOG + "Sending page moved event to position page [" + curPage.id + "] current=[" + curPage.current + "]");
          var pageChangedEvent: PageChangedEvent = new PageChangedEvent(curPage.id);
          dispatcher.dispatchEvent(pageChangedEvent); 
        }        
      }
    }
    
    public function presentationVOToPresentation(presVO:PresentationVO):Presentation {
      var presoPages:ArrayCollection = new ArrayCollection();
      var pages:ArrayCollection = presVO.getPages() as ArrayCollection;
      for (var k:int = 0; k < pages.length; k++) {
        var page:PageVO = pages[k] as PageVO;
        var pg:Page = copyPageVOToPage(page)
        presoPages.addItem(pg);
      }          
      
      var presentation: Presentation = new Presentation(presVO.id, presVO.name, presVO.isCurrent(), presoPages);
      return presentation;
    }
    
    public function changePresentation(presVO: PresentationVO):void {      
      // We've switched presentations. Mark the old presentation as not current.
      var curPres:Presentation = PresentationModel.getInstance().getCurrentPresentation();
      if (curPres != null) {
        curPres.current = false;
      } else {
        trace(LOG + "No previous active presentation.");
      }
            
      if (presVO.isCurrent()) {
        trace(LOG + "Making presentation [" + presVO.id + "] the  active presentation.");
        var newPres:Presentation = presentationVOToPresentation(presVO);
        PresentationModel.getInstance().replacePresentation(newPres);
        
        var event: PresentationChangedEvent = new PresentationChangedEvent(presVO.id);
        dispatcher.dispatchEvent(event);
        
        var curPage:Page = PresentationModel.getInstance().getCurrentPage();
        if (curPage != null) {
          var changePageCommand: ChangePageCommand = new ChangePageCommand(curPage.id, NUM_PRELOAD);
          dispatcher.dispatchEvent(changePageCommand);   
          
        }        
      } else {
        trace(LOG + "Switching presentation but presentation [" + presVO.id + "] is not current [" + presVO.isCurrent() + "]");
      }
    }
	
	public function removePresentation(presentationID:String):void {
		var removedEvent:RemovePresentationEvent = new RemovePresentationEvent(RemovePresentationEvent.PRESENTATION_REMOVED_EVENT);
		removedEvent.presentationName = presentationID;
		dispatcher.dispatchEvent(removedEvent);
		
		var currPresentation:Presentation = model.getCurrentPresentation();
		
		if(currPresentation && presentationID == currPresentation.id) {
			var uploadEvent:UploadEvent = new UploadEvent(UploadEvent.CLEAR_PRESENTATION);
			dispatcher.dispatchEvent(uploadEvent);
		}
		
		model.removePresentation(presentationID);
	}
  }
}