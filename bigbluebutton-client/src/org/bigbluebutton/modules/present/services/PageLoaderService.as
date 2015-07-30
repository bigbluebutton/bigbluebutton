package org.bigbluebutton.modules.present.services
{
  import com.asfusion.mate.events.Dispatcher;
  
  import org.as3commons.logging.api.ILogger;
  import org.as3commons.logging.api.getClassLogger;
  import org.bigbluebutton.modules.present.commands.ChangePageCommand;
  import org.bigbluebutton.modules.present.events.PageLoadedEvent;
  import org.bigbluebutton.modules.present.model.Page;
  import org.bigbluebutton.modules.present.model.PresentationModel;

  public class PageLoaderService
  {
	private static const LOGGER:ILogger = getClassLogger(PageLoaderService);      
    private var dispatcher:Dispatcher = new Dispatcher();
	
    public function loadPage(cmd: ChangePageCommand):void {
      var page:Page = PresentationModel.getInstance().getPage(cmd.pageId);
      if (page != null) {
        LOGGER.debug("Loading page [{0}]", [cmd.pageId]);
        page.loadPage(pageLoadedListener, cmd.preloadCount);
      }
      
    }
    
    public function pageLoadedListener(pageId:String, preloadCount:uint):void {
      var page: Page = PresentationModel.getInstance().getPage(pageId);
      if (page != null) {
        if (page.current) {
          // The page has been loaded and still the current displayed page.
          LOGGER.debug("Loaded page [{0}]. Dispatching event to display it.", [pageId]);
          var event: PageLoadedEvent = new PageLoadedEvent(page.id);
          dispatcher.dispatchEvent(event);
        }
		
		if (preloadCount > 0) {
			var pageIdParts:Array = pageId.split("/");
			LOGGER.debug("after split: {0}", [pageIdParts]);
			LOGGER.debug("trying to preload next page with id: {0}", [(parseInt(pageIdParts[1],10) + 1).toString()]);
			var changePageCommand: ChangePageCommand = new ChangePageCommand(pageIdParts[0]+"/"+(parseInt(pageIdParts[1], 10) + 1), preloadCount-1);
			dispatcher.dispatchEvent(changePageCommand);  
		}
      }
    }
  }
}