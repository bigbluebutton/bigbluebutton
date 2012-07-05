package org.bigbluebutton.modules.present.models
{
    import flash.events.IEventDispatcher;
    
    import mx.collections.ArrayCollection;
    
    import org.bigbluebutton.common.LogUtil;
    import org.bigbluebutton.core.model.MeetingModel;
    import org.bigbluebutton.core.model.UsersModel;
    import org.bigbluebutton.modules.present.controllers.events.PresentationEvent;
    import org.bigbluebutton.modules.present.vo.InitialPresentation;

    public class PresentationModel
    {        
        public var config:PresentationConfigModel;
        public var meeting:MeetingModel;
        public var users:UsersModel;
        
        private var _presentations:ArrayCollection = new ArrayCollection();
        private var _initialPresentation:InitialPresentation;
        private var _dispatcher:IEventDispatcher;
        private var _currentPresentation:Presentation;
        
        public function PresentationModel(dispatcher:IEventDispatcher)
        {
            _dispatcher = dispatcher;
        }
        
        public function get presentationNames():ArrayCollection {
            var names:ArrayCollection = new ArrayCollection();
            for (var i:int = 0; i < _presentations.length; i++) {
                var p:Presentation = _presentations.getItemAt(i) as Presentation;
                names.addItem(p.id);
            } 
            return names;
        }
        
        public function get currentPresentation():Presentation {
            return _currentPresentation;
        }
        
        public function addPresentation(id:String):void {
            var p:Presentation = new Presentation(id, config.presentationService, users.loggedInUser.meetingID, _dispatcher);
            _presentations.addItem(p);
        }
        
        public function loadCurrentPage():void {
            _currentPresentation.loadCurrentPage();    
        }
        
        public function loadPresentation(id:String):void {
            LogUtil.debug("Request to load presentation [" + id + "]");
             var i:int = getPresentationIndex(id);
             if (i >= 0) {
                 var p:Presentation = _presentations.getItemAt(i) as Presentation;
                 LogUtil.debug("Loading presentation [" + p.id + "]");
                 p.load();
             } else {
                 var event:PresentationEvent = new PresentationEvent(PresentationEvent.PRESENTATION_NOT_FOUND);
                 _dispatcher.dispatchEvent(event);
             }
        }
        
        public function setInitialPresentation(initPres:InitialPresentation):void {
            _initialPresentation = initPres;
            LogUtil.debug("Initial Presentation = " + initPres.toString());
            for (var i:int = 0; i < _initialPresentation.presentations.length; i++) {
                addPresentation(_initialPresentation.presentations.getItemAt(i) as String);
            }
            if (_initialPresentation.sharing) {
                var index:int = getPresentationIndex(_initialPresentation.presentationName);
                if (index >= 0) {
                    _currentPresentation = _presentations.getItemAt(index) as Presentation;
                    _currentPresentation.currentPage =  _initialPresentation.currentPage;
                    _currentPresentation.xOffset = _initialPresentation.xOffset;
                    _currentPresentation.yOffset = _initialPresentation.yOffset;
                    _currentPresentation.widthRatio = _initialPresentation.widthRatio;
                    _currentPresentation.heightRatio = _initialPresentation.heightRatio;
                    LogUtil.debug("Dispatching sharing presentation event");
                    var event:PresentationEvent = new PresentationEvent(PresentationEvent.SHARING_PRESENTATION_EVENT);
                    event.presentationID = _currentPresentation.id;
                    _dispatcher.dispatchEvent(event);
                } else {
                    LogUtil.error("Cannot find presentation [" + _initialPresentation.currentPage + "]");
                }
            }
            
        }
        
        public function setCurrentPageNumber(number:uint):void {
            
        }
        
        private function getPresentationIndex(id:String):int {
            for (var i:int = 0; i < _presentations.length; i++) {
                var p:Presentation = _presentations.getItemAt(i) as Presentation;
                if (p.id == id) return i;
            }
            return -1;            
        }

        private function hasPresentation(id:String):Boolean {
            for (var i:int = 0; i < _presentations.length; i++) {
                var p:Presentation = _presentations.getItemAt(i) as Presentation;
                if (p.id == id) return true;
            }
            return false;
        }
    }
}