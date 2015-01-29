package org.bigbluebutton.modules.present.services
{
  import com.asfusion.mate.events.Dispatcher;
  
  import org.bigbluebutton.modules.present.commands.ChangePageCommand;
  import org.bigbluebutton.modules.present.events.PageLoadedEvent;
  import org.bigbluebutton.modules.present.model.Page;
  import org.bigbluebutton.modules.present.model.PresentationModel;

  public class PageLoaderService
  {
    private static const LOG:String = "Present::PageLoaderService - ";
    private var dispatcher:Dispatcher = new Dispatcher();
	
    public function loadPage(cmd: ChangePageCommand):void {
      var page:Page = PresentationModel.getInstance().getPage(cmd.pageId);
      if (page != null) {
        trace(LOG + "Loading page [" + cmd.pageId + "]");
        page.loadPage(pageLoadedListener, cmd.preloadCount);
      }
      
    }
    
    public function pageLoadedListener(pageId:String, preloadCount:uint):void {
      var page: Page = PresentationModel.getInstance().getPage(pageId);
      if (page != null) {
        if (page.current) {
          // The page has been loaded and still the current displayed page.
          trace(LOG + "Loaded page [" + pageId + "]. Dispatching event to display it.");
          var event: PageLoadedEvent = new PageLoadedEvent(page.id);
          dispatcher.dispatchEvent(event);
        }
		
		if (preloadCount > 0) {
			var pageIdParts:Array = pageId.split("/");
			trace(LOG + "after split: " + pageIdParts);
			trace(LOG + "trying to preload next page with id: " + (parseInt(pageIdParts[1],10) + 1).toString());
			var changePageCommand: ChangePageCommand = new ChangePageCommand(pageIdParts[0]+"/"+(parseInt(pageIdParts[1], 10) + 1), preloadCount-1);
			dispatcher.dispatchEvent(changePageCommand);  
		}
      }
    }
  }
}