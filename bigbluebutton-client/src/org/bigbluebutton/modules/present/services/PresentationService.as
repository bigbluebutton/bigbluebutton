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
  import org.bigbluebutton.modules.present.model.PresentationPodManager;
  import org.bigbluebutton.modules.present.services.messages.PageVO;
  import org.bigbluebutton.modules.present.services.messages.PresentationVO;
  import org.bigbluebutton.modules.present.services.messaging.MessageReceiver;
  import org.bigbluebutton.main.api.JSLog;

  public class PresentationService
  {
	private static const LOGGER:ILogger = getClassLogger(PresentationService);      
    private static const NUM_PRELOAD:uint = 3;
    private var podManager: PresentationPodManager;
    private var receiver:MessageReceiver;
    private var dispatcher:Dispatcher;
    
    public function PresentationService() {
      podManager = PresentationPodManager.getInstance();
      podManager.setPresentationService(this);
      receiver = new MessageReceiver(this);
      dispatcher = new Dispatcher();
    }
    
    public function pageChanged(podId: String, pageId:String):void {
        podManager.getPod(podId).printPresentations("PresentationService::pageChanged bef");
      var np: Page = podManager.getPod(podId).getPage(pageId);
      if (np != null) {        
        var oldPage: Page = podManager.getPod(podId).getCurrentPage();
        if (oldPage != null) oldPage.current = false;

        np.current = true;
//        trace(LOG + "Sending page changed event. page [" + np.id + "] oldpage current=[" + oldPage.current + "] newPage current=[" + np.current + "]");  
        var changePageCommand: ChangePageCommand = new ChangePageCommand(podId, np.id, NUM_PRELOAD);
        dispatcher.dispatchEvent(changePageCommand);
          podManager.getPod(podId).printPresentations("PresentationService::pageChanged aft");
      }       
    }
    
    public function pageMoved(pageId:String, xOffset:Number, yOffset:Number, widthRatio:Number, heightRatio:Number):void {
//      var np: Page = model.getPage(pageId);
//      if (np != null) {
//        np.xOffset = xOffset;
//        np.yOffset = yOffset;
//        np.widthRatio = widthRatio;
//        np.heightRatio = heightRatio;
////        trace(LOG + "Sending page moved event. page [" + np.id + "] current=[" + np.current + "]");
//        var event: PageChangedEvent = new PageChangedEvent(np.id);
//        dispatcher.dispatchEvent(event);           
//      }       
    }
    
    private function copyPageVOToPage(p: PageVO):Page {
      var page:Page = new Page(p.id, p.num, p.current,
                               p.swfUri, p.thumbUri, p.txtUri,
                               p.svgUri, p.xOffset, p.yOffset,
                               p.widthRatio, p.heightRatio);      
      return page;      
    }
    
    public function addPresentations(podId: String, presos:ArrayCollection):void {
      for (var i:int = 0; i < presos.length; i++) {
        var pres:PresentationVO = presos.getItemAt(i) as PresentationVO;
        addPresentation(podId, pres);
      }
    }
    
    public function addPresentation(podId: String, pres:PresentationVO):void {
      var presentation:Presentation = presentationVOToPresentation(pres);

      JSLog.warn("__ PresentationService::addPresentation: " + presentation.id, {});

      podManager.getPod(podId).addPresentation(presentation);    
      LOGGER.debug("Added new presentation [{0}]", [presentation.id]);
      
      if (presentation.current) {
        JSLog.warn("__ PresentationService::addPresentation: YES presentation was current. displaying "
                  + presentation.name + "   in " + podId, {});
        LOGGER.debug("Making presentation [{0}] current [{1}]", [presentation.id, presentation.current]);
        JSLog.debug("Making presentation " + presentation.id + " current " , presentation.current);
        var event: PresentationChangedEvent = new PresentationChangedEvent(podId, pres.id);
        dispatcher.dispatchEvent(event);
        
        var curPage:Page = presentation.getCurrentPage();
        if (curPage != null) {
          var changePageCommand: ChangePageCommand = new ChangePageCommand(podId, curPage.id, NUM_PRELOAD);
          dispatcher.dispatchEvent(changePageCommand);          
          
          LOGGER.debug("Sending page moved event to position page [{0}] current=[{1}]", [curPage.id, curPage.current]);
          JSLog.debug("Sending page moved event to position page " + curPage.id + " current=", curPage.current);
          var pageChangedEvent: PageChangedEvent = new PageChangedEvent(podId, curPage.id);
          dispatcher.dispatchEvent(pageChangedEvent); 
        }        
      } else {
        JSLog.warn("__ PresentationService::addPresentation: presentation was NOT current. not displaying "
                + presentation.name + "   in " + podId, {});
      }
    }
    
    private function presentationVOToPresentation(presVO:PresentationVO):Presentation {
      var presoPages:ArrayCollection = new ArrayCollection();
      var pages:ArrayCollection = presVO.getPages() as ArrayCollection;
      for (var k:int = 0; k < pages.length; k++) {
        var page:PageVO = pages[k] as PageVO;
        var pg:Page = copyPageVOToPage(page);
        presoPages.addItem(pg);
      }          
      
      var presentation: Presentation = new Presentation(presVO.id, presVO.name, presVO.isCurrent(), presoPages, presVO.downloadable);
      return presentation;
    }
    
    public function changeCurrentPresentation(podId: String, presentationId:String):void {
      // We've switched presentations. Mark the old presentation as not current.
      var curPres:Presentation = podManager.getPod(podId).getCurrentPresentation();
      if (curPres != null) {
          JSLog.debug("300005a  " + curPres.name , curPres);
        curPres.current = false;
          JSLog.debug("300005b  " + curPres.name , curPres);
      } else {
        LOGGER.debug("No previous active presentation.");
        JSLog.debug("No previous active presentation.", {});
      }

      podManager.getPod(podId).printPresentations("PresentationService::changeCurrentPresentation bef");
      var newPres:Presentation = podManager.getPod(podId).getPresentation(presentationId);
      if (newPres != null) {
        LOGGER.debug("Making presentation [{0}] the  active presentation.", [presentationId]);
        JSLog.debug("Making presentation "  + presentationId + " the  active presentation.", {});
        newPres.current = true;


        podManager.getPod(podId).printPresentations("PresentationService::changeCurrentPresentation aft");

        var event: PresentationChangedEvent = new PresentationChangedEvent(podId, presentationId);
        dispatcher.dispatchEvent(event);

        var curPage:Page = podManager.getPod(podId).getCurrentPage();
        if (curPage != null) {
          var changePageCommand: ChangePageCommand = new ChangePageCommand(podId, curPage.id, NUM_PRELOAD);
          dispatcher.dispatchEvent(changePageCommand);
        }
      } else {
        LOGGER.debug("Could not find presentation to make current. id="+presentationId);
        JSLog.debug("Could not find presentation to make current. id="+presentationId, {});
      }
    }
    
    public function removeAllPresentations():void {
//      model.removeAllPresentations();
    }
    
	public function removePresentation(presentationID:String):void {
//		var removedEvent:RemovePresentationEvent = new RemovePresentationEvent(RemovePresentationEvent.PRESENTATION_REMOVED_EVENT);
//		removedEvent.presentationName = presentationID;
//		dispatcher.dispatchEvent(removedEvent);
//		
//		var currPresentation:Presentation = model.getCurrentPresentation();
//		
//		if(currPresentation && presentationID == currPresentation.id) {
//			var uploadEvent:UploadEvent = new UploadEvent(UploadEvent.CLEAR_PRESENTATION);
//			dispatcher.dispatchEvent(uploadEvent);
//		}
//		
//		model.removePresentation(presentationID);
//		var updateEvent:RemovePresentationEvent = new RemovePresentationEvent(RemovePresentationEvent.UPDATE_DOWNLOADABLE_FILES_EVENT);
//		dispatcher.dispatchEvent(updateEvent); // this event will trigger the disabling of the download button.
	}
  }
}