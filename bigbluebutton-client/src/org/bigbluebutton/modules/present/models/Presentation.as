package org.bigbluebutton.modules.present.models
{
    import flash.events.IEventDispatcher;
    
    import mx.collections.ArrayCollection;
    
    import org.bigbluebutton.common.LogUtil;
    import org.bigbluebutton.modules.present.controllers.events.PresentationEvent;
    import org.bigbluebutton.modules.present.services.PresentationLoaderService;

    public class Presentation
    {
        private var _id:String;
        private var _name:String;
        private var _presentationService:String;
        private var _meetingID:String;
        
        public var xOffset:Number = 0;;
        public var yOffset:Number = 0;
        public var widthRatio:Number = 100;
        public var heightRatio:Number = 100;
        
        public var currentPage:int;
        public var pages:ArrayCollection = new ArrayCollection();
        
        private var _dispatcher:IEventDispatcher;
        private var _loader:PresentationLoaderService;
        
        public function Presentation(id:String, presentationService:String, meetingID:String, dispatcher:IEventDispatcher)
        {
            _dispatcher = dispatcher;
           _id = id;  
           _presentationService = presentationService;
           _meetingID = meetingID;
           _loader = new PresentationLoaderService(this);
        }
        
        public function get id():String {
            return _id;
        }
        
        public function loadCurrentPage():void {
            var p:Page = pages.getItemAt(currentPage) as Page;
            p.loadPage();
            p.loadThumbnail();
        }
        
        public function addPage(number:uint, page:String, thumb:String):void {
            var pageURI:String = _presentationService + "/" + _meetingID + "/" + _meetingID + "/" + _id;
            var p:Page = new Page(number, page, thumb, pageURI);
            pages.addItem(p);
        }
		
		public function presentationLoaded():void {
            LogUtil.debug("Presentation [" + _id + "] has been loaded.");
			var event:PresentationEvent = new PresentationEvent(PresentationEvent.PRESENTATION_LOADED_EVENT);
            event.presentationID = _id;
            _dispatcher.dispatchEvent(event);
		}
        
        public function load():void {
            var fullURI:String = _presentationService + "/" + _meetingID + "/" + _meetingID + "/" + _id + "/slides";
            _loader.load(fullURI);
        }
        
        public function toString():String {
            return "[" + _id + "] " + _presentationService + "/" + _meetingID + "/" + _meetingID + "/" + _id + "/slides";
        }
    }
}