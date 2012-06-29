package org.bigbluebutton.modules.present.services
{
    import flash.events.Event;
    import flash.net.URLLoader;
    import flash.net.URLLoaderDataFormat;
    import flash.net.URLRequest;
    
    import org.bigbluebutton.common.LogUtil;
    import org.bigbluebutton.modules.present.models.Page;

    public class PageLoaderService
    {
        private var _loader:URLLoader = new URLLoader();
        private var _loaded:Boolean = false;
        private var _page:Page;
        
        public function PageLoaderService(page:Page)
        {
	        _page = page;
        }
        
        public function load(uri:String):void {
            if (!_loaded) {
                _loader.addEventListener(Event.COMPLETE, handleComplete);	
                _loader.dataFormat = URLLoaderDataFormat.BINARY;	
                _loader.load(new URLRequest(uri));                
            }
        }
        
        private function handleComplete(e:Event):void{
            _loaded = true;	
            _page.page = _loader.data;
            LogUtil.debug("Page loaded");
        }
    }
}