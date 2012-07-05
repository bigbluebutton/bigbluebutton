package org.bigbluebutton.modules.present.models
{
    import flash.events.IEventDispatcher;
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
        
        public var xOffset:Number = 0;
        public var yOffset:Number = 0;
        public var widthRatio:Number = 100;
        public var heightRatio:Number = 100;
        
        public var dispatcher:IEventDispatcher;
        
        public function Page(number:uint, pageURI:String, thumbURI:String, serviceURI:String):void {
            _number = number;
            _pageURI = pageURI;
            _thumbURI = thumbURI;
            _serviceURI = serviceURI;
            
            _pageLoader  = new PageLoaderService(this); 
            _thumbLoader  = new ThumbnailLoaderService(this);
        }
        
        public function get number():int {
            return _number;
        }
        public function loadPage():void {
            _pageLoader.dispatcher = dispatcher;
            _pageLoader.load(_serviceURI + "/" + _pageURI);
        }
        
        public function loadThumbnail():void {
            _thumbLoader.load(_serviceURI + "/" + _thumbURI);
        }
    }
}