package org.bigbluebutton.modules.present.services
{
  import com.asfusion.mate.events.Dispatcher;
  
  import mx.collections.ArrayCollection;
  
  import org.as3commons.logging.api.ILogger;
  import org.as3commons.logging.api.getClassLogger;
  import org.bigbluebutton.modules.present.commands.ChangePageCommand;
  import org.bigbluebutton.modules.present.events.PageChangedEvent;
  import org.bigbluebutton.modules.present.events.PresentationChangedEvent;
  import org.bigbluebutton.modules.present.events.RemovePresentationEvent;
  import org.bigbluebutton.modules.present.events.UploadEvent;
  import org.bigbluebutton.modules.present.model.Page;
  import org.bigbluebutton.modules.present.model.Presentation;
  import org.bigbluebutton.modules.present.model.PresentationModel;
  import org.bigbluebutton.modules.present.services.messages.PageVO;
  import org.bigbluebutton.modules.present.services.messages.PresentationVO;
  import org.bigbluebutton.modules.present.services.messaging.MessageReceiver;
  import org.bigbluebutton.modules.present.services.messaging.MessageSender;

  public class PresentationService
  {
	private static const LOGGER:ILogger = getClassLogger(PresentationService);      
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
    
    public function pageChanged(pageId:String):void {
      var np: Page = model.getPage(pageId);
      if (np != null) {        
        var oldPage: Page = PresentationModel.getInstance().getCurrentPage();
        if (oldPage != null) oldPage.current = false;
        
        np.current = true
//        trace(LOG + "Sending page changed event. page [" + np.id + "] oldpage current=[" + oldPage.current + "] newPage current=[" + np.current + "]");  
        var changePageCommand: ChangePageCommand = new ChangePageCommand(np.id, NUM_PRELOAD);
        dispatcher.dispatchEvent(changePageCommand);          
      }       
    }
    
    public function pageMoved(pageId:String, xOffset:Number, yOffset:Number, widthRatio:Number, heightRatio:Number):void {
      var np: Page = model.getPage(pageId);
      if (np != null) {
        np.xOffset = xOffset;
        np.yOffset = yOffset;
        np.widthRatio = widthRatio;
        np.heightRatio = heightRatio;
//        trace(LOG + "Sending page moved event. page [" + np.id + "] current=[" + np.current + "]");
        var event: PageChangedEvent = new PageChangedEvent(np.id);
        dispatcher.dispatchEvent(event);           
      }       
    }
    
    private function copyPageVOToPage(p: PageVO):Page {
      var page:Page = new Page(p.id, p.num, p.current,
                               p.swfUri, p.thumbUri, p.txtUri,
                               p.svgUri, p.xOffset, p.yOffset,
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
      LOGGER.debug("Added new presentation [{0}]", [presentation.id]);
      
      if (presentation.current) {
        LOGGER.debug("Making presentation [{0}] current [{1}]", [presentation.id, presentation.current]); 
        var event: PresentationChangedEvent = new PresentationChangedEvent(pres.id);
        dispatcher.dispatchEvent(event);
        
        var curPage:Page = presentation.getCurrentPage();
        if (curPage != null) {
          var changePageCommand: ChangePageCommand = new ChangePageCommand(curPage.id, NUM_PRELOAD);
          dispatcher.dispatchEvent(changePageCommand);          
          
          LOGGER.debug("Sending page moved event to position page [{0}] current=[{1}]", [curPage.id, curPage.current]);
          var pageChangedEvent: PageChangedEvent = new PageChangedEvent(curPage.id);
          dispatcher.dispatchEvent(pageChangedEvent); 
        }        
      }
    }
    
    private function presentationVOToPresentation(presVO:PresentationVO):Presentation {
      var presoPages:ArrayCollection = new ArrayCollection();
      var pages:ArrayCollection = presVO.getPages() as ArrayCollection;
      for (var k:int = 0; k < pages.length; k++) {
        var page:PageVO = pages[k] as PageVO;
        var pg:Page = copyPageVOToPage(page)
        presoPages.addItem(pg);
      }          
      
      var presentation: Presentation = new Presentation(presVO.id, presVO.name, presVO.isCurrent(), presoPages, presVO.downloadable);
      return presentation;
    }
    
    public function changeCurrentPresentation(presentationId:String):void {
      // We've switched presentations. Mark the old presentation as not current.
      var curPres:Presentation = PresentationModel.getInstance().getCurrentPresentation();
      if (curPres != null) {
        curPres.current = false;
      } else {
        LOGGER.debug("No previous active presentation.");
      }
      
      var newPres:Presentation = PresentationModel.getInstance().getPresentation(presentationId);
      if (newPres != null) {
        LOGGER.debug("Making presentation [{0}] the  active presentation.", [presentationId]);
        newPres.current = true;
        
        var event: PresentationChangedEvent = new PresentationChangedEvent(presentationId);
        dispatcher.dispatchEvent(event);
        
        var curPage:Page = PresentationModel.getInstance().getCurrentPage();
        if (curPage != null) {
          var changePageCommand: ChangePageCommand = new ChangePageCommand(curPage.id, NUM_PRELOAD);
          dispatcher.dispatchEvent(changePageCommand);
        }
      } else {
        LOGGER.debug("Could not find presentation to make current. id="+presentationId);
      }
    }
    
    public function removeAllPresentations():void {
      model.removeAllPresentations();
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
		var updateEvent:RemovePresentationEvent = new RemovePresentationEvent(RemovePresentationEvent.UPDATE_DOWNLOADABLE_FILES_EVENT);
		dispatcher.dispatchEvent(updateEvent); // this event will trigger the disabling of the download button.
	}
  }
}