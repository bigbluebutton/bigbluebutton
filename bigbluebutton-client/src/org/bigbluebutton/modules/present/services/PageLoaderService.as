package org.bigbluebutton.modules.present.services
{
  import org.bigbluebutton.modules.present.events.PageLoadedEvent;
  import org.bigbluebutton.modules.present.model.Page;
  import org.bigbluebutton.modules.present.model.PresentationModel;

  public class PageLoaderService
  {

    public function loadPage(pageId: String):void {
      var page:Page = PresentationModel.getInstance().getPage(pageId);
      page.loadSwf(pageLoadedListener);
    }
    
    public function pageLoadedListener(pageId: String):void {
      var page: Page = PresentationModel.getInstance().getPage(pageId);
      if (page != null) {
        if (page.current) {
          // The page has been loaded and still the current displayed page.
          var event: PageLoadedEvent = new PageLoadedEvent(page.id);
        }
      }
    }
  }
}