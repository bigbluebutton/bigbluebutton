package org.bigbluebutton.modules.present.services
{
    import flash.events.Event;
    import flash.events.IEventDispatcher;
    import flash.events.IOErrorEvent;
    import flash.net.URLLoader;
    import flash.net.URLRequest;
    
    import mx.rpc.http.HTTPService;
    
    import org.bigbluebutton.common.LogUtil;
    import org.bigbluebutton.modules.present.models.Presentation;
    import org.bigbluebutton.modules.present.models.PresentationConfigModel;

    public class PresentationLoaderService
    {
        private var _service:HTTPService = new HTTPService();
        private var _urlLoader:URLLoader;
        private var _slideUri:String;
        private var _dispatcher:IEventDispatcher;
               
        private var _presentation:Presentation;
        
        public function PresentationLoaderService(_presentation:Presentation)
        {
            _presentation = _presentation;
        }
        
        /**
         * Load slides from an HTTP service. Response is received in the Responder class' onResult method 
         * @param url
         * 
         */		
        public function load(url:String):void
        {
            _service.url = url;			
            _urlLoader = new URLLoader();
            _urlLoader.addEventListener(Event.COMPLETE, handleComplete);	
            _urlLoader.addEventListener(IOErrorEvent.IO_ERROR, handleIOErrorEvent);
            _urlLoader.load(new URLRequest(url));
            
        }
        
        private function handleComplete(e:Event):void{
            LogUtil.debug("Presentation loading complete");
            parse(new XML(e.target.data));				
        }
        
        private function handleIOErrorEvent(e:IOErrorEvent):void{
            LogUtil.error(e.toString());
        }
        
        public function parse(xml:XML):void{
            var list:XMLList = xml.presentation.slides.slide;
            var item:XML;
            LogUtil.debug("Slides: " + xml);
            
            var presentationName:String = xml.presentation[0].@name;
            LogUtil.debug("PresentationService::parse()...  presentationName=" + presentationName);
                        
            for each (item in list){		
                LogUtil.debug("Available slide: [number=" + item.@number + ", page=" + item.@name + ", thumb=" + item.@thumb);
                _presentation.addPage(item.@number, item.@name, item.@thumb);						

            }		            
        }
        
        /**
         * This is the response event. It is called when the PresentationService class sends a request to
         * the server. This class then responds with this event 
         * @param event
         * 
         */		
        public function result(event:Object):void
        {
            var xml:XML = new XML(event.result);
            var list:XMLList = xml.presentations;
            var item:XML;
            
            for each(item in list){
                LogUtil.debug("Available Modules: " + item.toXMLString() + " at " + item.text());
                
            }	
        }
        
        /**
         * Event is called in case the call the to server wasn't successful. This method then gets called
         * instead of the result() method above 
         * @param event
         * 
         */
        public function fault(event : Object):void
        {
            LogUtil.debug("Got fault [" + event.fault.toString() + "]");		
        }		
/*        
        public function loadPresentationListener(loaded:Boolean, presentationName:String):void {
            if (loaded) {
                LogUtil.debug('presentation has been loaded  presentationName=' + presentationName);
                var e:PresentationEvent = new PresentationEvent(PresentationEvent.PRESENTATION_LOADED);
                e.presentationName = presentationName;
                e.slides = _slides;
                dispatcher.dispatchEvent(e);
            } else {
                dispatcher.dispatchEvent(new PresentationEvent(PresentationEvent.PRESENTATION_NOT_LOADED));
                LogUtil.debug('failed to load presentation');
            }
        }
*/
    }
}