package org.bigbluebutton.modules.present.models
{
    import flash.events.IEventDispatcher;
    
    import mx.collections.ArrayCollection;
    
    import org.bigbluebutton.common.LogUtil;
    import org.bigbluebutton.core.model.MeetingModel;
    import org.bigbluebutton.core.model.UsersModel;
    import org.bigbluebutton.modules.present.vo.InitialPresentation;

    public class PresentationModel
    {
        
        public var config:PresentationConfigModel;
        public var meeting:MeetingModel;
        public var users:UsersModel;
        
        private var _presentations:ArrayCollection = new ArrayCollection();
        private var _initialPresentation:InitialPresentation;
        private var _dispatcher:IEventDispatcher;
        
        public function PresentationModel(dispatcher:IEventDispatcher)
        {
            _dispatcher = dispatcher;
        }
        
        public function addPresentation(id:String):void {
            var p:Presentation = new Presentation(id, config.presentationService, users.loggedInUser.meetingID);
            _presentations.addItem(p);
        }
        
        public function loadPresentation(id:String):void {
             var i:int = getPresentationIndex(id);
             if (i >= 0) {
                 var p:Presentation = _presentations.getItemAt(i) as Presentation;
                 p.load();
             }
        }
        
        public function setInitialPresentation(initPres:InitialPresentation):void {
            _initialPresentation = initPres;
            for (var i:int = 0; i < _initialPresentation.presentations.length; i++) {
                addPresentation(_initialPresentation.presentations.getItemAt(i) as String);
            }
            if (_initialPresentation.sharing) {
                loadPresentation(_initialPresentation.presentationName);
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