package org.bigbluebutton.modules.present.models
{
    import flash.utils.ByteArray;
    
    import org.bigbluebutton.modules.present.services.PageLoaderService;
    import org.bigbluebutton.modules.present.services.ThumbnailLoaderService;

    public class Page
    {
        public var page:ByteArray;
        public var thumbnail:ByteArray;
        
        private var _number:uint;
        private var _pageURI:String;
        private var _thumbURI:String;
        private var _serviceURI:String;
        
        private var _pageLoader:PageLoaderService;
        private var _thumbLoader:ThumbnailLoaderService;
        
        public function Page(number:uint, pageURI:String, thumbURI:String, serviceURI:String):void {
            _number = number;
            _pageURI = pageURI;
            _thumbURI = thumbURI;
            _serviceURI = serviceURI;
            
            _pageLoader  = new PageLoaderService(this); 
            _thumbLoader  = new ThumbnailLoaderService(this);
        }
        
        public function loadPage():void {
            _pageLoader.load(_serviceURI + "/" + _pageURI);
        }
        
        public function loadThumbnail():void {
            _thumbLoader.load(_serviceURI + "/" + _thumbURI);
        }
    }
}